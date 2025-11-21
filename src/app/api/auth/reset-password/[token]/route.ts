import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getPasswordResetToken, markPasswordResetTokenAsUsed, updateUserPassword } from '@/lib/db-operations';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { password } = await request.json();
    const { token } = await params;

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get token from database
    const resetToken = await getPasswordResetToken(token);
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await updateUserPassword(resetToken.user_id, hashedPassword);

    // Mark token as used
    await markPasswordResetTokenAsUsed(resetToken.id);

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}