/**
 * 2FA Login Verification API for Admin Users
 * POST /api/admin/2fa/login-verify
 * Verifies a TOTP code during admin login
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyTOTPToken, isValidTOTPToken } from '@/lib/2fa';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json();

    // Validate input
    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and TOTP token are required' },
        { status: 400 }
      );
    }

    // Validate token format
    if (!isValidTOTPToken(token)) {
      return NextResponse.json(
        { error: 'Invalid TOTP token format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Get user's 2FA secret and check if 2FA is enabled
    const user2FA = await sql`
      SELECT two_factor_secret, two_factor_enabled
      FROM users
      WHERE id = ${userId}
    `;

    if (!user2FA.rows[0]?.two_factor_enabled || !user2FA.rows[0]?.two_factor_secret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    const secret = user2FA.rows[0].two_factor_secret;

    // Verify the TOTP token
    const isValid = verifyTOTPToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid TOTP token. Please try again.' },
        { status: 400 }
      );
    }

    // Update last 2FA verification time
    await sql`
      UPDATE users
      SET two_factor_last_verified = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: '2FA verification successful'
    });

  } catch (error) {
    console.error('2FA login verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}