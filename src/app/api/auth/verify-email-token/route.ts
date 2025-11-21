import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailWithToken } from '@/lib/email-verification';
import { SignJWT } from 'jose';
import { scheduleWelcomeEmail, scheduleProfileOptimizationReminder, scheduleWeeklyCheckin } from '@/lib/email-engagement';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-2024'
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the email with the token
    const result = await verifyEmailWithToken(token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    const user = result.user;

    // Schedule welcome email sequence now that email is verified
    try {
      await scheduleWelcomeEmail(user.id);
      await scheduleProfileOptimizationReminder(user.id);
      await scheduleWeeklyCheckin(user.id);
      console.log(`✅ Email engagement sequence scheduled for verified user ${user.id}`);
    } catch (error) {
      console.error('Failed to schedule welcome emails:', error);
    }

    // Create JWT token for the verified user
    const jwtToken = await new SignJWT({
      userId: user.id,
      email: user.email
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true,
      },
      token: jwtToken,
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}