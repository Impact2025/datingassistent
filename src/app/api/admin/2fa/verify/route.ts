/**
 * 2FA Verification API for Admin Users
 * POST /api/admin/2fa/verify
 * Verifies a TOTP code and enables 2FA for the admin user
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { verifyTOTPToken, isValidTOTPToken } from '@/lib/2fa';
import { sql } from '@vercel/postgres';
import { verifyCSRF } from '@/lib/csrf-edge';

// Note: 2FA routes cannot use edge runtime because otplib requires Node.js crypto module
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfValid = await verifyCSRF(request);
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Require admin access
    const adminUser = await requireAdmin(request);

    const { userId, token } = await request.json();

    // Validate input
    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and TOTP token are required' },
        { status: 400 }
      );
    }

    // Verify the requesting admin can only verify 2FA for themselves
    if (userId !== adminUser.id) {
      return NextResponse.json(
        { error: 'You can only verify 2FA for your own account' },
        { status: 403 }
      );
    }

    // Validate token format
    if (!isValidTOTPToken(token)) {
      return NextResponse.json(
        { error: 'Invalid TOTP token format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Get user's 2FA secret
    const user2FA = await sql`
      SELECT two_factor_secret, two_factor_enabled
      FROM users
      WHERE id = ${userId}
    `;

    if (!user2FA.rows[0]?.two_factor_secret) {
      return NextResponse.json(
        { error: '2FA not set up for this account. Please setup 2FA first.' },
        { status: 400 }
      );
    }

    if (user2FA.rows[0]?.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account' },
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

    // Enable 2FA for the user
    await sql`
      UPDATE users
      SET two_factor_enabled = true,
          two_factor_verified_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: '2FA has been successfully enabled for your admin account'
    });

  } catch (error) {
    console.error('2FA verification error:', error);

    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}