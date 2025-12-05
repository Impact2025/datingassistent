/**
 * Backup Codes API for Admin 2FA
 * POST /api/admin/2fa/backup-codes - Generate new backup codes
 * PUT /api/admin/2fa/backup-codes - Use a backup code for login
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import { generateBackupCodes, hashBackupCode, verifyBackupCode, isValidBackupCode } from '@/lib/2fa';
import { sql } from '@vercel/postgres';
import { verifyCSRF } from '@/lib/csrf-edge';

export const dynamic = 'force-dynamic';

/**
 * POST - Generate new backup codes (requires admin auth)
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfValid = await verifyCSRF(request);
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Require admin access
    const adminUser = await requireAdmin(request);

    // Generate 10 new backup codes
    const codes = generateBackupCodes(10);

    // Hash codes for secure storage
    const hashedCodes = await Promise.all(codes.map(code => hashBackupCode(code)));

    // Store hashed codes in database
    await sql`
      UPDATE users
      SET backup_codes = ${JSON.stringify(hashedCodes)},
          backup_codes_generated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${adminUser.id}
    `;

    // Return plain codes to user (only time they'll see them)
    return NextResponse.json({
      success: true,
      codes,
      message: 'Bewaar deze codes veilig. Je ziet ze maar één keer!'
    });

  } catch (error: any) {
    console.error('Backup codes generation error:', error);

    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to generate backup codes' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Use a backup code for login (partial auth - after password)
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    // Validate input
    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and backup code are required' },
        { status: 400 }
      );
    }

    // Validate code format
    if (!isValidBackupCode(code)) {
      return NextResponse.json(
        { error: 'Invalid backup code format' },
        { status: 400 }
      );
    }

    // Get user's backup codes
    const userResult = await sql`
      SELECT backup_codes, two_factor_enabled
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

    if (!user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    const storedCodes: string[] = user.backup_codes || [];

    if (storedCodes.length === 0) {
      return NextResponse.json(
        { error: 'No backup codes available' },
        { status: 400 }
      );
    }

    // Verify the backup code
    const result = await verifyBackupCode(code, storedCodes);

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Invalid backup code' },
        { status: 400 }
      );
    }

    // Remove used code from array
    storedCodes.splice(result.usedIndex, 1);

    // Update database with remaining codes
    await sql`
      UPDATE users
      SET backup_codes = ${JSON.stringify(storedCodes)},
          two_factor_last_verified = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      remainingCodes: storedCodes.length,
      message: storedCodes.length <= 2
        ? 'Let op: Je hebt nog maar ' + storedCodes.length + ' backup codes over!'
        : 'Backup code geaccepteerd'
    });

  } catch (error) {
    console.error('Backup code verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify backup code' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get backup codes count (requires admin auth)
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);

    const result = await sql`
      SELECT backup_codes, backup_codes_generated_at
      FROM users
      WHERE id = ${adminUser.id}
    `;

    const codes: string[] = result.rows[0]?.backup_codes || [];

    return NextResponse.json({
      count: codes.length,
      generatedAt: result.rows[0]?.backup_codes_generated_at,
      warning: codes.length <= 2 ? 'Je hebt weinig backup codes over. Genereer nieuwe!' : null
    });

  } catch (error: any) {
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to get backup codes count' },
      { status: 500 }
    );
  }
}
