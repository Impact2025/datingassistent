import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailWithCode } from '@/lib/email-verification';
import { SignJWT } from 'jose';
import { scheduleWelcomeEmail, scheduleProfileOptimizationReminder, scheduleWeeklyCheckin } from '@/lib/email-engagement';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-2024'
);

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and verification code are required' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Code must be 6 digits.' },
        { status: 400 }
      );
    }

    // Verify the email with the code
    const result = await verifyEmailWithCode(userId, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
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
      // Non-blocking error
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

    // Set the JWT token as an httpOnly cookie for security
    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true,
      },
      token: jwtToken, // Also return token for immediate use
    });

    response.cookies.set('datespark_auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    console.log(`✅ Email verified for user ${user.id} (${user.email})`);

    return response;

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}