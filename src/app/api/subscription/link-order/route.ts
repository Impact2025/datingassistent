import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';
import { verifyCSRF } from '@/lib/csrf-edge';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfValid = await verifyCSRF(request);
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const { userId, orderId } = await request.json();

    console.log('🔗 Linking order to user:', { userId, orderId });

    if (!userId || !orderId) {
      return NextResponse.json(
        { error: 'userId and orderId are required' },
        { status: 400 }
      );
    }

    const hasConnectionString = Boolean(
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL
    );

    if (!hasConnectionString) {
      console.warn('⚠️ Cannot link order: missing Postgres connection string');
      return NextResponse.json({
        success: false,
        warning: 'missing_connection_string',
      });
    }

    // Get order details from database
    const orderResult = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;

    if (orderResult.rows.length === 0) {
      console.error('❌ Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = orderResult.rows[0];
    console.log('📦 Order data:', {
      id: orderData.id,
      status: orderData.status,
      package: orderData.package_type,
      billing: orderData.billing_period
    });

    // Check if order is paid
    if (orderData.status !== 'completed' && orderData.status !== 'paid') {
      console.warn('⚠️ Order not paid yet:', orderData.status);
      return NextResponse.json(
        { error: 'Order not paid yet. Please wait for payment confirmation.' },
        { status: 400 }
      );
    }

    // Get user information
    const userResult = await sql`
      SELECT id, email, name FROM users WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      console.error('❌ User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    console.log('👤 User found:', user.email);

    // Create or update subscription
    const rawAmount = typeof orderData.amount === 'number' ? orderData.amount : parseFloat(orderData.amount);
    const amountInEuros = Number.isFinite(rawAmount) ? rawAmount / 100 : 0;

    await createOrUpdateSubscription(userId, {
      packageType: orderData.package_type,
      billingPeriod: orderData.billing_period,
      status: 'active',
      orderId: orderId,
      startDate: new Date().toISOString(),
      amount: amountInEuros,
    });

    // Update order with userId
    await sql`
      UPDATE orders
      SET user_id = ${userId},
          linked_to_user = true,
          updated_at = NOW()
      WHERE id = ${orderId}
    `;

    console.log('✅ Subscription activated for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Order linked successfully',
      subscription: {
        package: orderData.package_type,
        billing: orderData.billing_period
      }
    }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('missing_connection_string')) {
      console.warn('⚠️ Cannot link order: missing Postgres connection string');
      return NextResponse.json({
        success: false,
        warning: 'missing_connection_string',
      });
    }

    console.error('❌ Link order error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}