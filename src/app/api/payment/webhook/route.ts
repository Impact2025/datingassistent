import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getMultiSafePayOrder } from '@/lib/multisafepay';
import crypto from 'crypto';

/**
 * MultiSafePay Webhook Handler
 *
 * 🔒 Security measures:
 * 1. ✅ Verifies transaction by fetching from MultiSafePay API (not trusting webhook data directly)
 * 2. ✅ Webhook secret verification (if configured)
 * 3. ✅ IP whitelist check for MultiSafePay IPs
 * 4. ✅ Idempotent: Can be called multiple times safely
 * 5. ✅ Validates order exists in database before updating
 * 6. ✅ Only processes known status values
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify webhook origin
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // MultiSafePay webhook IPs (check MultiSafePay documentation for current list)
    // This is a basic check - for production, maintain updated IP list
    const MULTISAFEPAY_IP_RANGES = process.env.MULTISAFEPAY_WEBHOOK_IPS?.split(',') || [];

    // Only enforce IP whitelist if configured (allows testing with ngrok)
    if (MULTISAFEPAY_IP_RANGES.length > 0 && process.env.NODE_ENV === 'production') {
      const isValidIp = MULTISAFEPAY_IP_RANGES.some(range => clientIp.startsWith(range));
      if (!isValidIp) {
        console.error(`❌ Webhook from unauthorized IP: ${clientIp}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 🔒 SECURITY: Verify webhook secret (if configured)
    const webhookSecret = process.env.MULTISAFEPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const receivedSecret = request.headers.get('x-webhook-secret') ||
                            request.headers.get('authorization')?.replace('Bearer ', '');

      if (receivedSecret !== webhookSecret) {
        console.error('❌ Invalid webhook secret');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  WARNING: MULTISAFEPAY_WEBHOOK_SECRET not configured in production!');
    }

    // Extract transaction ID from webhook payload
    const body = await request.json();
    const { transactionid } = body;

    if (!transactionid) {
      console.error('❌ Webhook received without transaction ID');
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    // Validate transaction ID format (basic sanity check)
    if (typeof transactionid !== 'string' || transactionid.trim().length === 0) {
      console.error('❌ Invalid transaction ID format');
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    console.log('🔔 Webhook received for transaction:', transactionid);

    // Get order details from MultiSafePay
    const orderResult = await getMultiSafePayOrder(transactionid);

    if (!orderResult.success) {
      console.error('Failed to get order:', orderResult);
      return NextResponse.json({ error: 'Failed to get order' }, { status: 500 });
    }

    const order = orderResult.data;
    const status = order.status; // completed, cancelled, expired, etc.
    const orderId = order.order_id;

    // Validate status is a known value (prevent injection of arbitrary statuses)
    const VALID_STATUSES = ['completed', 'paid', 'cancelled', 'expired', 'initialized', 'uncleared', 'declined', 'void', 'refunded', 'partial_refunded'];
    if (!VALID_STATUSES.includes(status)) {
      console.error(`❌ Unknown status received: ${status}`);
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    console.log(`✅ Webhook processing: Order ${orderId}, Status: ${status}`);

    // Get order from database
    const orderQuery = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;

    if (orderQuery.rows.length === 0) {
      console.error(`❌ Order not found in database: ${orderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const dbOrder = orderQuery.rows[0];
    console.log('📦 Database order:', { id: dbOrder.id, status: dbOrder.status, user_id: dbOrder.user_id });

    // Check if this is a duplicate webhook (idempotency)
    if (dbOrder.status === status) {
      console.log(`ℹ️ Order already has status ${status}, skipping update (idempotent)`);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // Prevent status downgrades (e.g., completed -> cancelled)
    const STATUS_PRIORITY = {
      'completed': 10,
      'paid': 10,
      'refunded': 9,
      'partial_refunded': 8,
      'cancelled': 5,
      'expired': 5,
      'declined': 5,
      'void': 5,
      'uncleared': 3,
      'initialized': 1,
    };

    const currentPriority = STATUS_PRIORITY[dbOrder.status as keyof typeof STATUS_PRIORITY] || 0;
    const newPriority = STATUS_PRIORITY[status as keyof typeof STATUS_PRIORITY] || 0;

    if (currentPriority > newPriority) {
      console.warn(`⚠️ Attempted status downgrade from ${dbOrder.status} to ${status}, ignoring`);
      return NextResponse.json({ success: true, message: 'Status downgrade prevented' });
    }

    // Update order status
    await sql`
      UPDATE orders
      SET status = ${status},
          updated_at = NOW()
      WHERE id = ${orderId}
    `;

    console.log(`✅ Order status updated from ${dbOrder.status} to ${status}`);

    if (status === 'completed' || status === 'paid') {
      console.log('💳 Payment successful!');

      // If order already linked to user, we're done
      if (dbOrder.user_id && dbOrder.linked_to_user) {
        console.log(`✅ Order already linked to user ${dbOrder.user_id}`);
        return NextResponse.json({ success: true, message: 'Order already processed' });
      }

      // Order is paid but not yet linked to user - that's OK
      // The auto-create endpoint will handle linking when user visits payment success page
      console.log('ℹ️ Order paid but not linked yet - will be linked when user creates account');

    } else if (status === 'cancelled' || status === 'expired') {
      console.log(`⚠️ Payment ${status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// Allow GET for MultiSafePay webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' });
}