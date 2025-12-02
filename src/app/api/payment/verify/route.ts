import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';

export const runtime = 'edge';

/**
 * Payment Status Types for typed responses
 */
export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'failed' | 'expired' | 'initialized' | 'paid';

export interface PaymentVerifyResponse {
  success: boolean;
  status: PaymentStatus;
  orderId: string;
  message: string;
  details?: {
    packageType?: string;
    programName?: string;
    amount?: number;
    paidAt?: string;
    enrolled?: boolean;
  };
  error?: string;
  errorCode?: string;
}

const STATUS_MESSAGES: Record<string, string> = {
  pending: 'Je betaling wordt verwerkt...',
  initialized: 'Je betaling wordt gestart...',
  completed: 'Je betaling is succesvol voltooid!',
  paid: 'Je betaling is succesvol voltooid!',
  cancelled: 'Je betaling is geannuleerd.',
  failed: 'Je betaling is mislukt. Probeer het opnieuw.',
  expired: 'Je betaling is verlopen. Start een nieuwe betaling.'
};

/**
 * GET /api/payment/verify?orderId=xxx
 * Poll payment status (for success page real-time updates)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json<PaymentVerifyResponse>({
        success: false,
        status: 'failed',
        orderId: '',
        message: 'Order ID is verplicht',
        errorCode: 'MISSING_ORDER_ID'
      }, { status: 400 });
    }

    // Check orders table first (for package purchases)
    const orderResult = await sql`
      SELECT
        o.*,
        u.name,
        u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
      LIMIT 1
    `;

    // If not found in orders, check payment_transactions (for program purchases)
    if (orderResult.rows.length === 0) {
      const txResult = await sql`
        SELECT
          pt.*,
          p.name as program_name
        FROM payment_transactions pt
        LEFT JOIN programs p ON pt.program_id = p.id
        WHERE pt.order_id = ${orderId}
        LIMIT 1
      `;

      if (txResult.rows.length === 0) {
        return NextResponse.json<PaymentVerifyResponse>({
          success: false,
          status: 'failed',
          orderId,
          message: 'Bestelling niet gevonden',
          errorCode: 'ORDER_NOT_FOUND'
        }, { status: 404 });
      }

      let tx = txResult.rows[0];

      // In development mode with test orders, auto-complete after a few seconds
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isTestOrder = tx.order_id?.startsWith('ORDER-');

      if (isDevelopment && isTestOrder && tx.status === 'pending') {
        // Auto-complete test payments in development after creation
        const createdAt = new Date(tx.created_at);
        const now = new Date();
        const secondsSinceCreation = (now.getTime() - createdAt.getTime()) / 1000;

        // Auto-complete after 5 seconds in development
        if (secondsSinceCreation > 5) {
          await sql`
            UPDATE payment_transactions
            SET status = 'completed', paid_at = NOW(), updated_at = NOW()
            WHERE order_id = ${orderId}
          `;

          // Create program enrollment
          await sql`
            INSERT INTO program_enrollments (user_id, program_id, order_id, status, enrolled_at)
            VALUES (${tx.user_id}, ${tx.program_id}, ${orderId}, 'active', NOW())
            ON CONFLICT (user_id, program_id, order_id) DO NOTHING
          `;

          console.log('✅ Test payment auto-completed:', orderId);
          tx.status = 'completed';
          tx.paid_at = now;
        }
      }

      const isComplete = tx.status === 'completed';

      return NextResponse.json<PaymentVerifyResponse>({
        success: isComplete,
        status: tx.status as PaymentStatus,
        orderId,
        message: STATUS_MESSAGES[tx.status] || 'Onbekende status',
        details: {
          programName: tx.program_name,
          amount: tx.amount,
          paidAt: tx.paid_at?.toISOString(),
          enrolled: isComplete
        }
      });
    }

    const order = orderResult.rows[0];
    const isComplete = order.status === 'completed' || order.status === 'paid';

    return NextResponse.json<PaymentVerifyResponse>({
      success: isComplete,
      status: order.status as PaymentStatus,
      orderId,
      message: STATUS_MESSAGES[order.status] || 'Onbekende status',
      details: {
        packageType: order.package_type,
        amount: order.amount,
        paidAt: order.paid_at?.toISOString() || order.updated_at?.toISOString()
      }
    });

  } catch (error) {
    console.error('💥 Payment verify GET error:', error);
    return NextResponse.json<PaymentVerifyResponse>({
      success: false,
      status: 'failed',
      orderId: '',
      message: 'Er is een fout opgetreden bij het verifiëren van je betaling.',
      errorCode: 'VERIFICATION_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Note: CSRF protection is globally disabled in middleware
    // If you want to re-enable it, update src/lib/csrf-edge.ts getCSRFConfig()

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