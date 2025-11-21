import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createPasswordResetToken, getUserByEmail } from '@/lib/db-operations';
import { sendPasswordResetEmail } from '@/lib/email-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      // For security, we don't reveal if the email exists
      return NextResponse.json(
        { message: 'If your email is registered, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    const resetToken = await createPasswordResetToken(user.id, token, expiresAt);

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Send email
    const emailSent = await sendPasswordResetEmail(
      user.email,
      user.display_name || user.name || 'User',
      resetUrl
    );

    if (!emailSent) {
      console.error('Failed to send password reset email');
      // We still return success to avoid revealing if email was sent
    }

    return NextResponse.json(
      { message: 'If your email is registered, you will receive a password reset link.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}