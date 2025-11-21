import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';

export async function POST(request: NextRequest) {
  try {
    const { userId, packageType } = await request.json();

    if (!userId || !packageType) {
      return NextResponse.json(
        { error: 'User ID and package type are required' },
        { status: 400 }
      );
    }

    // Create subscription data for testing
    const subscriptionData = {
      packageType: packageType as 'sociaal' | 'core' | 'pro' | 'premium',
      billingPeriod: 'yearly' as const,
      status: 'active' as const,
      orderId: `test-${Date.now()}`,
      startDate: new Date().toISOString(),
      amount: 0 // Test activation
    };

    // Activate subscription
    await createOrUpdateSubscription(userId, subscriptionData);

    console.log(`✅ TEST: Subscription activated for user ${userId}: ${packageType}`);

    return NextResponse.json({
      success: true,
      message: `Test subscription activated for user ${userId}: ${packageType}`
    });

  } catch (error) {
    console.error('Test subscription activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}