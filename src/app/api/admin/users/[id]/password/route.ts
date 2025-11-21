import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/users/[id]/password - Change user password
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
    const targetUserId = params.id;
    const passwordData = await request.json();
    const { newPassword, confirmPassword, sendNotification } = passwordData;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check if user exists
    const userCheck = await sql`SELECT id FROM users WHERE id = ${targetUserId}`;
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await sql`
      UPDATE users SET password_hash = ${hashedPassword}, updated_at = NOW() WHERE id = ${targetUserId}
    `;

    // TODO: Send notification email if requested
    if (sendNotification) {
      console.log(`Password change notification would be sent for user ${targetUserId}`);
    }

    return NextResponse.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}