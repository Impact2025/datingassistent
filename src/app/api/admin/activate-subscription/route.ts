import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';

export async function POST(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin(request);

    const { userId, packageType, orderId } = await request.json();

    if (!userId || !packageType) {
      return NextResponse.json(
        { error: 'User ID and package type are required' },
        { status: 400 }
      );
    }

    // Create subscription data
    const subscriptionData = {
      packageType: packageType as 'sociaal' | 'core' | 'pro' | 'premium',
      billingPeriod: 'yearly' as const,
      status: 'active' as const,
      orderId: orderId || `admin-${Date.now()}`,
      startDate: new Date().toISOString(),
      amount: 0 // Admin activation
    };

    // Activate subscription
    await createOrUpdateSubscription(userId, subscriptionData);

    return NextResponse.json({
      success: true,
      message: `Subscription activated for user ${userId}: ${packageType}`
    });

  } catch (error) {
    console.error('Admin subscription activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}