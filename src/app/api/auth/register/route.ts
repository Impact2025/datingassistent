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

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-2024'
);

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
    const { name, email, password, plan } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Dit emailadres is al bij ons bekend. Vraag hier een wachtwoord aan.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database as unverified
    const result = await sql`
      INSERT INTO users (name, email, password_hash, email_verified, created_at, updated_at)
      VALUES (${name}, ${email}, ${hashedPassword}, false, NOW(), NOW())
      RETURNING id, name, email, created_at, subscription_type
    `;

    const user = result.rows[0];

    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    await storeVerificationCode(user.id, verificationCode);

    // Send verification code email
    const verificationEmailSent = await sendVerificationCodeEmail(user.email, user.name, verificationCode);

    if (!verificationEmailSent) {
      console.error(`❌ Failed to send verification email to ${user.email}`);
      // Still create the account but log the error
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

    // Return user data WITHOUT token - email verification required first
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: false,
        createdAt: user.created_at,
        subscriptionType: user.subscription_type,
        trialActive: plan === 'pro',
      },
      message: plan === 'pro'
        ? 'Account aangemaakt! Je 3-daagse Pro trial begint zodra je email verifieert.'
        : 'Account aangemaakt. Controleer je email voor verificatie.',
      requiresEmailVerification: true,
      trialStarted: plan === 'pro',
    }, { status: 201 });

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