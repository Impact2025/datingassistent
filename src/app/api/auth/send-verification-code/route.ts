import { NextRequest, NextResponse } from 'next/server';
import { generateVerificationCode, storeVerificationCode, sendVerificationCodeEmail } from '@/lib/email-verification';
import { sql } from '@vercel/postgres';
import { getClientIdentifier, rateLimitAuthEndpoint, createRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Rate limiting per user (max 3 requests per 5 minutes)
    const identifier = `send-code-${userId}`;
    const rateLimit = await rateLimitAuthEndpoint(identifier);

    if (!rateLimit.success) {
      const resetDate = new Date(rateLimit.resetAt);
      const headers = createRateLimitHeaders(rateLimit);

      return NextResponse.json(
        {
          error: 'Te veel verificatie codes aangevraagd',
          message: `Probeer het opnieuw na ${resetDate.toLocaleTimeString()}`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Get user data
    const userResult = await sql`
      SELECT name, email, email_verified
      FROM users
      WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    await storeVerificationCode(userId, verificationCode);

    // Send verification email
    const emailSent = await sendVerificationCodeEmail(user.email, user.name, verificationCode);

    if (!emailSent) {
      console.error(`Failed to send verification code to ${user.email}`);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    console.log(`✅ Verification code sent to ${user.email} for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 600, // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Send verification code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}