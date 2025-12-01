import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/webhook
 * MultiSafePay webhook handler
 * Called by MultiSafePay when payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📞 MultiSafePay webhook received:', body);

    const { transactionid, status } = body;

    if (!transactionid) {
      console.error('❌ No transaction ID in webhook');
      return NextResponse.json({ error: 'No transaction ID' }, { status: 400 });
    }

    // Get transaction from database
    const result = await sql\`
      SELECT * FROM payment_transactions
      WHERE order_id = \${transactionid}
      LIMIT 1
    \`;

    if (result.rows.length === 0) {
      console.error('❌ Transaction not found:', transactionid);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = result.rows[0];

    // Update transaction status
    let newStatus = 'pending';
    let paidAt = null;
    let cancelledAt = null;

    switch (status) {
      case 'completed':
        newStatus = 'completed';
        paidAt = new Date();

        // Create program enrollment
        await sql\`
          INSERT INTO program_enrollments (
            user_id, program_id, order_id, status, enrolled_at
          ) VALUES (
            \${transaction.user_id},
            \${transaction.program_id},
            \${transactionid},
            'active',
            NOW()
          )
          ON CONFLICT (user_id, program_id, order_id) DO NOTHING
        \`;

        console.log('✅ Payment completed and enrollment created');
        break;

      case 'cancelled':
      case 'expired':
        newStatus = 'cancelled';
        cancelledAt = new Date();
        console.log('❌ Payment cancelled/expired');
        break;

      case 'declined':
      case 'void':
        newStatus = 'failed';
        console.log('❌ Payment failed');
        break;

      default:
        console.log('ℹ️ Payment status:', status);
    }

    // Update transaction
    await sql\`
      UPDATE payment_transactions
      SET
        status = \${newStatus},
        multisafepay_transaction_id = \${transactionid},
        multisafepay_status = \${status},
        paid_at = \${paidAt},
        cancelled_at = \${cancelledAt},
        webhook_data = \${JSON.stringify(body)},
        updated_at = NOW()
      WHERE order_id = \${transactionid}
    \`;

    console.log('✅ Webhook processed successfully');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('💥 Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/webhook
 * Verification endpoint
 */
export async function GET() {
  return NextResponse.json({ message: 'MultiSafePay webhook endpoint' });
}
