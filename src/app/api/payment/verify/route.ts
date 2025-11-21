import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';

export async function POST(request: NextRequest) {
  try {
    const { orderId, mock } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find order in database
    const orderResult = await sql`
      SELECT
        o.*,
        u.name,
        u.email,
        u.subscription_type
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
    `;

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    // In development, allow test/pending orders to be verified
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTestOrder = order.id?.startsWith('DA-');

    console.log('🔍 Payment verification:', {
      orderId: order.id,
      status: order.status,
      mock,
      isDevelopment,
      isTestOrder
    });

    // Check if payment is completed (or if it's a test/mock payment)
    // For free orders (amount = 0), status is 'paid', for paid orders it's 'completed'
    const isFreeOrder = order.amount === 0;
    const isPaymentComplete = order.status === 'completed' || (order.status === 'paid' && isFreeOrder);

    if (!isPaymentComplete && !mock && !(isDevelopment && isTestOrder)) {
      console.warn('⚠️ Payment not completed:', { orderId, status: order.status, amount: order.amount });
      return NextResponse.json(
        { error: 'Payment not completed', success: false, status: order.status },
        { status: 400 }
      );
    }

    // For test orders in development, update status to completed
    if (isDevelopment && isTestOrder && (order.status === 'pending' || order.status === 'initialized')) {
      await sql`
        UPDATE orders
        SET status = 'completed', updated_at = NOW()
        WHERE id = ${orderId}
      `;
      console.log('✅ Test order marked as completed:', orderId);
      order.status = 'completed';
    }

    // Update user subscription if not already done
    if (order.user_id && isPaymentComplete) {
      // Check if user already has an active subscription
      const existingSub = await sql`
        SELECT subscription_status FROM users
        WHERE id = ${order.user_id}
      `;

      if (existingSub.rows.length === 0 || existingSub.rows[0].subscription_status !== 'active') {
        // Calculate subscription end date
        const subscriptionEnd = new Date();
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + (order.billing_period === 'yearly' ? 12 : 1));

        // Create subscription object
        const subscriptionData = {
          packageType: order.package_type as 'sociaal' | 'core' | 'pro' | 'premium',
          billingPeriod: order.billing_period as 'monthly' | 'yearly',
          status: 'active' as const,
          orderId: order.id,
          startDate: new Date().toISOString(),
          amount: order.amount
        };

        // Use the proper subscription creation function
        await createOrUpdateSubscription(order.user_id, subscriptionData);

        console.log(`✅ Subscription activated for user ${order.user_id}: ${order.package_type}`);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        package_type: order.package_type,
        amount: order.amount,
        billing_period: order.billing_period,
        payment_provider: order.payment_provider,
        status: order.status
      },
      user: order.user_id ? {
        id: order.user_id,
        name: order.name,
        email: order.email,
        subscription_type: order.subscription_type
      } : null
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}