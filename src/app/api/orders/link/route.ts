import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';

export async function POST(req: NextRequest) {
  try {
    const { orderId, userId } = await req.json();

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Order ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get order details
    const orderResult = await sql`
      SELECT * FROM orders
      WHERE id = ${orderId}
    `;

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    const rawAmount = typeof order.amount === 'number' ? order.amount : parseFloat(order.amount);
    const amountInEuros = Number.isFinite(rawAmount) ? rawAmount / 100 : 0;

    // Create subscription for user
    await createOrUpdateSubscription(userId, {
      packageType: order.package_type,
      billingPeriod: order.billing_period,
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

    console.log('✅ Order linked to user:', { orderId, userId });

    return NextResponse.json({
      success: true,
      message: 'Order linked to user successfully',
    });
  } catch (error) {
    console.error('Error linking order to user:', error);
    return NextResponse.json(
      { error: 'Failed to link order to user' },
      { status: 500 }
    );
  }
}
