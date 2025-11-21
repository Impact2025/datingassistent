import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db-operations';
import { sendSubscriptionCancelledEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Get user information
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Send subscription cancelled email
    const emailSent = await sendSubscriptionCancelledEmail(
      user.email,
      user.display_name || user.name || 'User'
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send subscription cancelled email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled email sent successfully'
    });
  } catch (error) {
    console.error('Subscription cancelled email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}