import { NextRequest, NextResponse } from 'next/server';
import { resendVerificationEmail } from '@/lib/email-verification';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email and check if they're unverified
    const result = await resendVerificationEmail(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to resend verification email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Resend verification email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}