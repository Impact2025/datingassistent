import { NextRequest, NextResponse } from 'next/server';
import { sendTextEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Send simple text email as fallback
    const emailSent = await sendTextEmail(
      email,
      'Welcome to DatingAssistent!',
      `Hi ${name},

Welcome to DatingAssistent! We're excited to have you on board.

You can log in to your account at: http://localhost:9002/login

Best regards,
The DatingAssistent Team`
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully (fallback text version)'
    });
  } catch (error) {
    console.error('Welcome email test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}