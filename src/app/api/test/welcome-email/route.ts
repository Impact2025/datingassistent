import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Send welcome email
    const emailSent = await sendWelcomeEmail(
      email,
      name,
      'http://localhost:9002/login'
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully'
    });
  } catch (error) {
    console.error('Welcome email test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}