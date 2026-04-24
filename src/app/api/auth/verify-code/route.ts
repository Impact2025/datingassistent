import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailWithCode } from '@/lib/email-verification';
import { signToken, cookieConfig } from '@/lib/jwt-config';
import { scheduleWelcomeEmail, scheduleProfileOptimizationReminder, scheduleWeeklyCheckin } from '@/lib/email-engagement';

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
      logger.log(`✅ Email engagement sequence scheduled for verified user ${user.id}`);
    } catch (error) {
      console.error('Failed to schedule welcome emails:', error);
      // Non-blocking error
    }

    // Create JWT token using the canonical signToken() so payload format is consistent
    // across all auth paths (register, login, magic-link, verify-code).
    const jwtToken = await signToken({
      id: user.id,
      email: user.email,
      displayName: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true,
      },
      token: jwtToken,
    });

    response.cookies.set(cookieConfig.name, jwtToken, cookieConfig.options);

    logger.log(`✅ Email verified for user ${user.id} (${user.email})`);

    return response;

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}