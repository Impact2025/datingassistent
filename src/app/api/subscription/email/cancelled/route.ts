import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db-operations';
import { sendSubscriptionCancelledEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { userId, endDate, subscriptionType, stats } = await request.json();

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

    // Calculate end date if not provided (default to 30 days from now)
    const calculatedEndDate = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Send subscription cancelled email
    const emailSent = await sendSubscriptionCancelledEmail(
      user.email,
      user.display_name || user.name || 'User',
      calculatedEndDate,
      subscriptionType || user.subscription_type || 'Core',
      stats
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