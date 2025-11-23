import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, userEmail, subscriptionType } = await request.json();

    if (!userId || !userName || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName, userEmail' },
        { status: 400 }
      );
    }

    // Generate login URL
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`;

    // Send welcome email
    const emailSent = await sendWelcomeEmail(userEmail, userName, loginUrl);

    if (emailSent) {
      console.log(`✅ Welcome email sent successfully to ${userEmail}`);
      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully'
      });
    } else {
      console.error(`❌ Failed to send welcome email to ${userEmail}`);
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Welcome email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}