import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';

/**
 * Development-only API to fix subscription for current user
 * This helps when payment verification doesn't properly activate subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log(`🔧 Fixing subscription for user ${userId}...`);

    // Get user's latest order
    const orderResult = await sql`
      SELECT *
      FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'No orders found for this user' }, { status: 404 });
    }

    const order = orderResult.rows[0];

    // Update order status to completed if it's not
    if (order.status !== 'completed') {
      await sql`
        UPDATE orders
        SET status = 'completed', updated_at = NOW()
        WHERE id = ${order.id}
      `;
      console.log(`✅ Order ${order.id} marked as completed`);
    }

    // Create subscription data
    const subscriptionData = {
      packageType: order.package_type as 'sociaal' | 'core' | 'pro' | 'premium',
      billingPeriod: order.billing_period as 'monthly' | 'yearly',
      status: 'active' as const,
      orderId: order.id,
      startDate: new Date().toISOString(),
      amount: order.amount
    };

    // Activate subscription
    await createOrUpdateSubscription(userId, subscriptionData);

    console.log(`✅ Subscription activated for user ${userId}: ${order.package_type}`);

    // Reset journey to start
    await sql`
      DELETE FROM user_journey_progress WHERE user_id = ${userId}
    `;

    await sql`
      INSERT INTO user_engagement (
        user_id, journey_day, last_activity_date, current_streak, longest_streak, total_logins
      ) VALUES (
        ${userId}, 1, CURRENT_DATE, 1, 1, 1
      )
      ON CONFLICT (user_id) DO UPDATE SET
        journey_day = 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    `;

    console.log(`✅ Journey reset for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription and journey fixed!',
      subscription: subscriptionData
    });

  } catch (error) {
    console.error('Fix subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fix subscription', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
