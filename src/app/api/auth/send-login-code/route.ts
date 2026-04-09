import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getClientIdentifier, rateLimitAuthEndpoint, createRateLimitHeaders } from '@/lib/rate-limit';
import { generateVerificationCode, storeVerificationCode, sendVerificationCodeEmail } from '@/lib/email-verification';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await rateLimitAuthEndpoint(identifier);

  if (!rateLimit.success) {
    const resetDate = new Date(rateLimit.resetAt);
    const headers = createRateLimitHeaders(rateLimit);

    return NextResponse.json(
      {
        error: 'Too many attempts',
        message: `Rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`,
        resetAt: resetDate.toISOString(),
      },
      { status: 429, headers }
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email — works for already-verified users
    const result = await sql`
      SELECT id, name, email, email_verified
      FROM users
      WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      // Return a generic response to prevent email enumeration
      logger.log(`Login code requested for non-existent email: ${email}`);
      return NextResponse.json(
        { error: 'Als dit e-mailadres bij ons bekend is, ontvang je een inlogcode.' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      logger.log(`Login code requested for unverified user: ${user.id}`);
      return NextResponse.json(
        { error: 'Je account is nog niet geverifieerd. Controleer je email voor de verificatiecode.' },
        { status: 403 }
      );
    }

    // Generate and store 6-digit OTP code (reuses same DB columns as registration verification)
    const code = generateVerificationCode();
    await storeVerificationCode(user.id, code);

    // Send the code via email
    const emailSent = await sendVerificationCodeEmail(user.email, user.name, code);
    if (!emailSent) {
      console.error(`Failed to send login code to ${user.email}`);
      return NextResponse.json(
        { error: 'Kon de inlogcode niet versturen. Probeer het opnieuw.' },
        { status: 500 }
      );
    }

    logger.log(`Login code sent to user ${user.id} (${user.email})`);

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send login code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
