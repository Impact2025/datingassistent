/**
 * 2FA Setup API for Admin Users
 * POST /api/admin/2fa/setup
 * Generates a new TOTP secret and QR code for admin 2FA setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { generateTOTPSecret, generateQRCodeDataURL } from '@/lib/2fa';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Require admin access
    const adminUser = await requireAdmin(request);

    const { userId } = await request.json();

    // Verify the requesting admin can only setup 2FA for themselves
    if (userId !== adminUser.id) {
      return NextResponse.json(
        { error: 'You can only setup 2FA for your own account' },
        { status: 403 }
      );
    }

    // Check if user already has 2FA enabled
    const existing2FA = await sql`
      SELECT two_factor_enabled, two_factor_secret
      FROM users
      WHERE id = ${userId}
    `;

    if (existing2FA.rows[0]?.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account' },
        { status: 400 }
      );
    }

    // Generate new TOTP secret
    const secret = generateTOTPSecret();

    // Generate QR code
    const qrCodeDataURL = await generateQRCodeDataURL(
      secret,
      adminUser.email,
      'DatingAssistent Admin'
    );

    // Store the secret temporarily (not enabled yet)
    // We'll enable it only after verification
    await sql`
      UPDATE users
      SET two_factor_secret = ${secret},
          two_factor_enabled = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      secret,
      qrCode: qrCodeDataURL,
      message: 'Scan the QR code with your authenticator app and verify with the generated code'
    });

  } catch (error) {
    console.error('2FA setup error:', error);

    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}