/**
 * Admin Password Change API
 * POST /api/admin/change-password
 * Allows admin users to change their password
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { verifyCSRF } from '@/lib/csrf-edge';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfValid = await verifyCSRF(request);
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Require admin access
    const adminUser = await requireAdmin(request);

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get current user data including password hash
    const userResult = await sql`
      SELECT password_hash FROM users WHERE id = ${adminUser.id}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentHash = userResult.rows[0].password_hash;

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, currentHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    await sql`
      UPDATE users
      SET password_hash = ${newPasswordHash},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${adminUser.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully changed'
    });

  } catch (error) {
    console.error('Password change error:', error);

    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}