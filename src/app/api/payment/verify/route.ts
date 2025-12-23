import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';
import { scheduleKickstartUpsellSequence, cancelKickstartUpsellSequence } from '@/lib/kickstart-upsell-service';

export const dynamic = 'force-dynamic';

/**
 * Helper: Initialize Kickstart day-based progress for a user
 * This creates user_day_progress records for all 21 days
 */
async function initializeKickstartProgress(userId: number, programId: number): Promise<void> {
  try {
    // Check if program_days table exists and has data
    const daysResult = await sql`
      SELECT id, dag_nummer FROM program_days
      WHERE program_id = ${programId}
      ORDER BY dag_nummer
    `;

    if (daysResult.rows.length === 0) {
      console.log('⚠️ No Kickstart days found, skipping progress initialization');
      return;
    }

    // Check if user already has progress records
    const existingProgress = await sql`
      SELECT COUNT(*) as count FROM user_day_progress
      WHERE user_id = ${userId} AND program_id = ${programId}
    `;

    if (parseInt(existingProgress.rows[0].count) > 0) {
      console.log(`ℹ️ User ${userId} already has Kickstart progress, skipping initialization`);
      return;
    }

    // Initialize progress for each day
    for (const day of daysResult.rows) {
      // Day 1 is available, rest are locked
      const status = day.dag_nummer === 1 ? 'available' : 'locked';

      await sql`
        INSERT INTO user_day_progress (user_id, program_id, day_id, status)
        VALUES (${userId}, ${programId}, ${day.id}, ${status})
        ON CONFLICT (user_id, day_id) DO NOTHING
      `;
    }

    console.log(`✅ Initialized Kickstart progress for user ${userId} (${daysResult.rows.length} days)`);
  } catch (error) {
    // Don't fail the payment if progress init fails - we can retry later
    console.error('⚠️ Error initializing Kickstart progress (non-fatal):', error);
  }
}

const MULTISAFEPAY_API_KEY = process.env.MULTISAFEPAY_API_KEY || '';
const MULTISAFEPAY_ENVIRONMENT = process.env.MULTISAFEPAY_ENVIRONMENT || 'test';

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
    programSlug?: string;
    amount?: number;
    paidAt?: string;
    enrolled?: boolean;
    nextAction?: string;
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
 * Check payment status directly from MultiSafePay API
 * This is a fallback when webhook hasn't arrived yet
 */
async function checkMultiSafePayStatus(orderId: string): Promise<{ status: string; success: boolean } | null> {
  if (!MULTISAFEPAY_API_KEY) {
    console.log('⚠️ No MultiSafePay API key configured');
    return null;
  }

  const baseUrl = MULTISAFEPAY_ENVIRONMENT === 'live'
    ? 'https://api.multisafepay.com/v1/json'
    : 'https://testapi.multisafepay.com/v1/json';

  try {
    const response = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MULTISAFEPAY_API_KEY
      }
    });

    if (!response.ok) {
      console.error('❌ MultiSafePay API error:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('📞 MultiSafePay status check:', { orderId, status: data.data?.status });

    if (data.success && data.data) {
      return {
        status: data.data.status,
        success: data.data.status === 'completed'
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to check MultiSafePay status:', error);
    return null;
  }
}

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
          p.name as program_name,
          p.slug as program_slug
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

      const tx = txResult.rows[0];

      // If status is pending, check MultiSafePay API directly as fallback
      if (tx.status === 'pending' || tx.status === 'initialized') {
        console.log('🔍 Status is pending, checking MultiSafePay API directly...');
        const mspStatus = await checkMultiSafePayStatus(orderId);

        if (mspStatus?.success && mspStatus.status === 'completed') {
          console.log('✅ MultiSafePay reports completed, updating database...');

          // Update payment transaction
          await sql`
            UPDATE payment_transactions
            SET status = 'completed', paid_at = NOW(), updated_at = NOW(),
                multisafepay_status = 'completed'
            WHERE order_id = ${orderId}
          `;

          // Create program enrollment if not exists
          await sql`
            INSERT INTO program_enrollments (user_id, program_id, order_id, status, enrolled_at)
            VALUES (${tx.user_id}, ${tx.program_id}, ${orderId}, 'active', NOW())
            ON CONFLICT (user_id, program_id, order_id) DO NOTHING
          `;

          // Initialize Kickstart progress if this is a Kickstart purchase
          if (tx.program_slug === 'kickstart') {
            await initializeKickstartProgress(tx.user_id, tx.program_id);

            // Schedule Kickstart → Transformatie upsell email sequence
            try {
              await scheduleKickstartUpsellSequence({
                userId: tx.user_id,
                purchaseDate: new Date(),
                kickstartOrderId: orderId,
              });
              console.log(`📧 Scheduled upsell sequence for Kickstart user ${tx.user_id}`);
            } catch (upsellError) {
              // Don't fail payment if upsell scheduling fails
              console.error('⚠️ Failed to schedule upsell sequence (non-fatal):', upsellError);
            }
          }

          // Cancel Kickstart upsell sequence if user upgrades to Transformatie
          if (tx.program_slug === 'transformatie') {
            try {
              await cancelKickstartUpsellSequence(tx.user_id);
              console.log(`🛑 Cancelled Kickstart upsell sequence for user ${tx.user_id} (upgraded to Transformatie)`);
            } catch (cancelError) {
              console.error('⚠️ Failed to cancel upsell sequence (non-fatal):', cancelError);
            }
          }

          // Initialize standard program progress (only for non-Kickstart programs)
          if (tx.program_slug !== 'kickstart') {
            try {
              const statsResult = await sql`
                SELECT
                  COUNT(DISTINCT pm.id) as total_modules,
                  COUNT(DISTINCT l.id) as total_lessons
                FROM program_modules pm
                LEFT JOIN lessons l ON l.module_id = pm.id AND l.is_published = true
                WHERE pm.program_id = ${tx.program_id}
                  AND pm.is_published = true
              `;

              const { total_modules, total_lessons } = statsResult.rows[0];

              const firstLessonResult = await sql`
                SELECT l.id
                FROM lessons l
                JOIN program_modules pm ON l.module_id = pm.id
                WHERE pm.program_id = ${tx.program_id}
                  AND pm.is_published = true
                  AND l.is_published = true
                ORDER BY pm.display_order, l.display_order
                LIMIT 1
              `;

              const currentLessonId = firstLessonResult.rows[0]?.id || null;

              await sql`
                INSERT INTO user_program_progress (
                  user_id, program_id,
                  started_at, total_modules, total_lessons,
                  overall_progress_percentage,
                  current_lesson_id
                ) VALUES (
                  ${tx.user_id},
                  ${tx.program_id},
                  NOW(),
                  ${total_modules},
                  ${total_lessons},
                  0,
                  ${currentLessonId}
                )
                ON CONFLICT (user_id, program_id) DO NOTHING
              `;
            } catch (progressError) {
              console.warn('⚠️ Could not initialize standard program progress (non-fatal):', progressError);
            }
          }

          console.log('✅ Payment completed via API check, enrollment initialized');
          tx.status = 'completed';
          tx.paid_at = new Date();
        } else if (mspStatus && mspStatus.status !== 'initialized') {
          // Update status from MSP if it's different (cancelled, failed, etc.)
          console.log(`📞 MultiSafePay status: ${mspStatus.status}`);
          await sql`
            UPDATE payment_transactions
            SET multisafepay_status = ${mspStatus.status}, updated_at = NOW()
            WHERE order_id = ${orderId}
          `;
        }
      }

      const isComplete = tx.status === 'completed';

      // Determine next action - always redirect to dashboard
      // Dashboard handles program access and onboarding automatically
      let nextAction = '/dashboard';
      if (isComplete && tx.program_slug) {
        // Special handling for Kickstart: check if onboarding is completed
        if (tx.program_slug === 'kickstart') {
          // Kickstart onboarding is now integrated in the dashboard
          // The dashboard automatically detects if onboarding is needed
          // and shows the KickstartIntakeChat component
          const onboardingCheck = await sql`
            SELECT kickstart_onboarding_completed
            FROM program_enrollments
            WHERE user_id = ${tx.user_id} AND program_id = ${tx.program_id}
            LIMIT 1
          `;

          const onboardingCompleted = onboardingCheck.rows[0]?.kickstart_onboarding_completed;

          // Always go to dashboard - it handles onboarding detection automatically
          // If onboarding not done: dashboard shows KickstartIntakeChat
          // If onboarding done: dashboard shows normal content with Kickstart access
          nextAction = '/dashboard';
        } else if (tx.program_slug === 'transformatie') {
          // Transformatie has its own onboarding flow at /transformatie
          // The page automatically detects if onboarding is needed
          nextAction = '/transformatie';
        } else {
          // For other programs, go to dashboard
          // The dashboard provides access to all enrolled programs
          nextAction = '/dashboard';
        }
      }

      return NextResponse.json<PaymentVerifyResponse>({
        success: isComplete,
        status: tx.status as PaymentStatus,
        orderId,
        message: STATUS_MESSAGES[tx.status] || 'Onbekende status',
        details: {
          programName: tx.program_name,
          programSlug: tx.program_slug,
          amount: tx.amount,
          paidAt: tx.paid_at?.toISOString(),
          enrolled: isComplete,
          nextAction: nextAction
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