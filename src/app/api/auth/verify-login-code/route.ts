import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { signToken, cookieConfig } from '@/lib/jwt-config';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and code are required' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(String(code))) {
      return NextResponse.json(
        { error: 'Ongeldige code. Voer een 6-cijferige code in.' },
        { status: 400 }
      );
    }

    // Fetch user with stored code
    const result = await sql`
      SELECT id, name, email, email_verified, verification_code, code_expires_at, code_attempts, subscription_type
      FROM users
      WHERE id = ${userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden.' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // User must be verified to use OTP login
    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Je account is nog niet geverifieerd.' },
        { status: 403 }
      );
    }

    // Check too many failed attempts (max 5)
    if (user.code_attempts >= 5) {
      return NextResponse.json(
        { error: 'Te veel mislukte pogingen. Vraag een nieuwe code aan.' },
        { status: 429 }
      );
    }

    // Check expiry using database time to avoid timezone issues
    const expiredCheck = await sql`
      SELECT code_expires_at < NOW() AS is_expired
      FROM users
      WHERE id = ${userId}
    `;
    const isExpired = expiredCheck.rows[0]?.is_expired;

    if (isExpired || !user.code_expires_at) {
      return NextResponse.json(
        { error: 'De inlogcode is verlopen. Vraag een nieuwe code aan.' },
        { status: 400 }
      );
    }

    // Verify the code
    if (user.verification_code !== String(code)) {
      // Increment failed attempts
      await sql`
        UPDATE users
        SET code_attempts = code_attempts + 1
        WHERE id = ${userId}
      `;
      return NextResponse.json(
        { error: 'Onjuiste code. Controleer de code en probeer opnieuw.' },
        { status: 400 }
      );
    }

    // Code is correct — clear it (do NOT touch email_verified)
    await sql`
      UPDATE users
      SET verification_code = NULL,
          code_expires_at = NULL,
          code_attempts = 0
      WHERE id = ${userId}
    `;

    logger.log(`OTP login successful for user ${user.id} (${user.email})`);

    // Issue JWT using centralized jwt-config (same as password login)
    const token = await signToken({
      id: user.id,
      email: user.email,
      displayName: user.name || user.email.split('@')[0],
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
          subscriptionType: user.subscription_type,
        },
        token,
      },
      { status: 200 }
    );

    // Set httpOnly cookie using centralized config
    response.cookies.set(cookieConfig.name, token, cookieConfig.options);

    return response;
  } catch (error) {
    console.error('Verify login code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
