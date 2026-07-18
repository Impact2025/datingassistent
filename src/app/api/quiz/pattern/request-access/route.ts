import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import { getClientIdentifier, rateLimitAuthEndpoint, createRateLimitHeaders } from '@/lib/rate-limit';
import { generateVerificationToken } from '@/lib/email-verification';
import { sendQuizMagicLinkEmail } from '@/lib/email-service';
import { logger } from '@/lib/logger';

/**
 * Quiz analysis access gate.
 *
 * Called when a quiz user submits their name + email in the email gate.
 * Instead of issuing a JWT immediately (which allows fake emails), we:
 *   1. Create the account if the user is new (without JWT, email_verified=false).
 *   2. Send a magic link to the email address.
 *   3. Return { success: true } — no token.
 *
 * The user must click the link in their inbox. magic-login issues the JWT
 * and sets email_verified=true, then redirects to /quiz/dating-patroon.
 * PatternQuiz detects the authenticated user and auto-advances to the result.
 */
export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimit = await rateLimitAuthEndpoint(identifier);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
      { status: 429, headers: createRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const { email, firstName, marketingConsent = false } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Naam en e-mailadres zijn vereist' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = firstName.trim();

    // Check if user already exists
    const existingUser = await sql`
      SELECT id, name FROM users WHERE email = ${normalizedEmail}
    `;

    let userId: number;
    let userName: string;

    if (existingUser.rows.length === 0) {
      // New user — create account without JWT or email_verified flag.
      // email_verified becomes true when they click the magic link.
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const result = await sql`
        INSERT INTO users (name, email, password_hash, email_verified, created_at, updated_at)
        VALUES (${normalizedName}, ${normalizedEmail}, ${hashedPassword}, false, NOW(), NOW())
        RETURNING id
      `;

      userId = result.rows[0].id;
      userName = normalizedName;

      // Store marketing consent (non-critical)
      sql`
        INSERT INTO email_preferences (user_id, marketing_emails)
        VALUES (${userId}, ${marketingConsent})
        ON CONFLICT (user_id) DO UPDATE SET marketing_emails = ${marketingConsent}
      `.catch(() => {});

      logger.log(`Quiz: new user ${userId} created for ${normalizedEmail}`);
    } else {
      userId = existingUser.rows[0].id;
      userName = normalizedName; // Use the name they entered now
      logger.log(`Quiz: existing user ${userId} requesting access`);
    }

    // Generate a 1-hour magic link token
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await sql`
      UPDATE users
      SET verification_token      = ${token},
          verification_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${userId}
    `;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.datingassistent.nl';
    const magicUrl = `${baseUrl}/api/auth/magic-login?token=${token}&next=${encodeURIComponent('/quiz/dating-patroon')}`;

    // Send quiz-specific magic link email — awaited so Vercel doesn't kill the lambda early
    const emailSent = await sendQuizMagicLinkEmail(normalizedEmail, userName, magicUrl);
    if (!emailSent) {
      console.error(`❌ Quiz magic link email failed for ${normalizedEmail}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Quiz request-access error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
