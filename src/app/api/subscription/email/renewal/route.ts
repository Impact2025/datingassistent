import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db-operations';
import { sendSubscriptionRenewalEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, currency, renewalDate } = await request.json();

    if (!userId || !amount || !currency || !renewalDate) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, currency, renewalDate' },
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

    // Send subscription renewal email
    const emailSent = await sendSubscriptionRenewalEmail(
      user.email,
      user.display_name || user.name || 'User',
      amount,
      currency,
      renewalDate
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send subscription renewal email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription renewal email sent successfully'
    });
  } catch (error) {
    console.error('Subscription renewal email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}