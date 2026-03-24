import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { sql } from '@vercel/postgres';
import { sendWelcomeEmail } from '@/lib/email-service';
import { scheduleWelcomeEmail, scheduleProfileOptimizationReminder, scheduleWeeklyCheckin } from '@/lib/email-engagement';
import { getClientIdentifier, rateLimitAuthEndpoint, createRateLimitHeaders } from '@/lib/rate-limit';
import { generateVerificationCode, storeVerificationCode, sendVerificationCodeEmail } from '@/lib/email-verification';
import { startProgressiveTrial } from '@/lib/trial-management';
import { notifyAdminNewLead } from '@/lib/admin-notifications';
import { getJWTSecret } from '@/lib/jwt-secret';
import { validatePassword, getPasswordErrorMessage } from '@/lib/password-validation';
import { signToken, cookieConfig } from '@/lib/jwt-config';

const JWT_SECRET = getJWTSecret();

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await rateLimitAuthEndpoint(identifier);

  if (!rateLimit.success) {
    const resetDate = new Date(rateLimit.resetAt);
    const headers = createRateLimitHeaders(rateLimit);

    return NextResponse.json(
      {
        error: 'Too many registration attempts',
        message: `Rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`,
        resetAt: resetDate.toISOString(),
      },
      { status: 429, headers }
    );
  }

  try {
    const { name, email, password, plan, needsPasswordSetup } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Quiz users use an auto-generated password — skip strict validation
    if (!needsPasswordSetup) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { error: getPasswordErrorMessage(passwordValidation) },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    // SECURITY: Generic error message to prevent email enumeration
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Er is een probleem met deze registratie. Als je al een account hebt, log dan in.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Quiz users (needsPasswordSetup) get auto-verified so they can go straight
    // through the OTO → checkout flow without an email verification interruption.
    // They receive a password-setup email instead.
    const emailVerified = needsPasswordSetup ? true : false;

    const result = await sql`
      INSERT INTO users (name, email, password_hash, email_verified, created_at, updated_at)
      VALUES (${name}, ${email}, ${hashedPassword}, ${emailVerified}, NOW(), NOW())
      RETURNING id, name, email, created_at, subscription_type
    `;

    const user = result.rows[0];

    if (needsPasswordSetup) {
      // Send password-setup email (non-blocking) — user can ignore until after checkout
      try {
        const { sendPasswordResetEmail } = await import('@/lib/email-service');
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl'}/reset-password?userId=${user.id}`;
        await sendPasswordResetEmail(user.email, user.name, resetUrl);
      } catch (e) {
        console.warn('Password setup email failed (non-critical):', e);
      }
    } else {
      // Standard flow: send verification code
      const verificationCode = generateVerificationCode();
      await storeVerificationCode(user.id, verificationCode);
      const verificationEmailSent = await sendVerificationCodeEmail(user.email, user.name, verificationCode);
      if (!verificationEmailSent) {
        console.error(`❌ Failed to send verification email to ${user.email}`);
      }
    }

    // Start progressive trial for Pro plan signups
    if (plan === 'pro') {
      await startProgressiveTrial(user.id);
      console.log(`✅ Started 3-day progressive trial for user ${user.id}`);
    }

    console.log(`✅ User ${user.id} created, verification email sent to ${user.email}`);

    // Send admin notification (non-blocking)
    notifyAdminNewLead({
      userId: user.id,
      name: user.name,
      email: user.email,
      registrationSource: 'legacy',
      photoScore: null,
      intakeData: null,
      otoShown: false,
      otoAccepted: false,
    }).catch(err => console.error('Failed to notify admin:', err));

    const responseBody = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified,
        createdAt: user.created_at,
        subscriptionType: user.subscription_type,
        trialActive: plan === 'pro',
      },
      message: needsPasswordSetup
        ? 'Account aangemaakt. Je kunt direct verder.'
        : plan === 'pro'
          ? 'Account aangemaakt! Je 3-daagse Pro trial begint zodra je email verifieert.'
          : 'Account aangemaakt. Controleer je email voor verificatie.',
      requiresEmailVerification: !needsPasswordSetup,
      trialStarted: plan === 'pro',
    };

    // Quiz users (needsPasswordSetup) get auto-logged in immediately
    // so they can proceed through the OTO → checkout flow without interruption.
    if (needsPasswordSetup) {
      const token = await signToken({
        id: user.id,
        email: user.email,
        displayName: user.name,
      });
      const response = NextResponse.json(responseBody, { status: 201 });
      response.cookies.set(cookieConfig.name, token, cookieConfig.options);
      return response;
    }

    return NextResponse.json(responseBody, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Provide more specific error messages
    if (error.message) {
      console.error('Error details:', error.message);
    }
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    // Check for common database connection issues
    if (error.message && (error.message.includes('connect') || error.message.includes('database'))) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your database configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function resolveBaseUrl(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;

  if (envUrl) {
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
    return `https://${envUrl}`;
  }

  try {
    const currentUrl = new URL(request.url);
    return currentUrl.origin;
  } catch (error) {
    console.error('Failed to resolve base URL for welcome email:', error);
    return 'http://localhost:3000';
  }
}