import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Validating payment for order:', orderId);

    // Check if database connection is available
    const hasConnectionString = Boolean(
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL
    );

    if (!hasConnectionString) {
      console.warn('⚠️ Cannot validate payment: missing Postgres connection string');
      return NextResponse.json({
        paid: false,
        error: 'Database connection not available'
      });
    }

    // Get order details from database
    const orderResult = await sql`
      SELECT id, status, package_type, billing_period, amount, created_at
      FROM orders
      WHERE id = ${orderId}
    `;

    if (orderResult.rows.length === 0) {
      console.log('❌ Order not found:', orderId);
      return NextResponse.json({
        paid: false,
        error: 'Order not found'
      });
    }

    const order = orderResult.rows[0];
    console.log('📦 Order status:', order.status);

    // Check if order is paid
    const isPaid = order.status === 'completed' || order.status === 'paid';

    return NextResponse.json({
      paid: isPaid,
      orderId: order.id,
      status: order.status,
      package: order.package_type,
      billing: order.billing_period,
      amount: order.amount,
      createdAt: order.created_at
    });

  } catch (error) {
    console.error('❌ Error validating payment:', error);
    return NextResponse.json(
      {
        paid: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}