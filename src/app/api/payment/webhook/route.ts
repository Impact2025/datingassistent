import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const MULTISAFEPAY_API_KEY = process.env.MULTISAFEPAY_API_KEY || '';

/**
 * Verify MultiSafePay webhook signature
 * MultiSafePay sends a timestamp and signature in headers for verification
 */
function verifyWebhookSignature(
  payload: string,
  timestamp: string | null,
  signature: string | null
): boolean {
  // Skip verification in development or if no API key
  if (!MULTISAFEPAY_API_KEY || process.env.NODE_ENV === 'development') {
    console.log('⚠️ Webhook signature verification skipped (dev mode or no API key)');
    return true;
  }

  if (!timestamp || !signature) {
    console.warn('⚠️ Missing webhook signature headers');
    // For now, allow webhooks without signature (gradual rollout)
    // In production, change this to: return false;
    return true;
  }

  // Create expected signature: HMAC-SHA512 of timestamp + payload
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha512', MULTISAFEPAY_API_KEY)
    .update(signedPayload)
    .digest('hex');

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * POST /api/payment/webhook
 * MultiSafePay webhook handler
 * Called by MultiSafePay when payment status changes
 *
 * SECURITY:
 * - Signature verification (when available)
 * - Idempotency check (prevents duplicate processing)
 * - Transaction locking (prevents race conditions)
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  try {
    // Verify webhook signature
    const timestamp = request.headers.get('x-msp-timestamp');
    const signature = request.headers.get('x-msp-signature');

    if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    console.log('📞 MultiSafePay webhook received:', body);

    const { transactionid, status } = body;

    if (!transactionid) {
      console.error('❌ No transaction ID in webhook');
      return NextResponse.json({ error: 'No transaction ID' }, { status: 400 });
    }

    // Get transaction from database with lock for update (prevents race conditions)
    const result = await sql`
      SELECT * FROM payment_transactions
      WHERE order_id = ${transactionid}
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;

    if (result.rows.length === 0) {
      console.error('❌ Transaction not found:', transactionid);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = result.rows[0];

    // IDEMPOTENCY CHECK: Skip if already processed with same status
    if (transaction.status === 'completed' && status === 'completed') {
      console.log('ℹ️ Transaction already completed, skipping duplicate webhook');
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // Update transaction status
    let newStatus = 'pending';
    let paidAt = null;
    let cancelledAt = null;

    switch (status) {
      case 'completed':
        newStatus = 'completed';
        paidAt = new Date();

        // IDEMPOTENCY: Check if enrollment already exists
        const existingEnrollment = await sql`
          SELECT id FROM program_enrollments
          WHERE user_id = ${transaction.user_id}
          AND program_id = ${transaction.program_id}
          LIMIT 1
        `;

        if (existingEnrollment.rows.length > 0) {
          console.log('ℹ️ Enrollment already exists, skipping creation');
        } else {
          // Create program enrollment
          await sql`
            INSERT INTO program_enrollments (
              user_id, program_id, order_id, status, enrolled_at
            ) VALUES (
              ${transaction.user_id},
              ${transaction.program_id},
              ${transactionid},
              'active',
              NOW()
            )
            ON CONFLICT (user_id, program_id, order_id) DO NOTHING
          `;
          console.log('✅ Enrollment created');
        }

        // INCREMENT COUPON USAGE if coupon was used
        if (transaction.coupon_code) {
          try {
            await sql`
              UPDATE coupons
              SET used_count = used_count + 1, updated_at = NOW()
              WHERE UPPER(code) = UPPER(${transaction.coupon_code})
              AND (used_count < max_uses OR max_uses IS NULL)
            `;
            console.log('✅ Coupon usage incremented:', transaction.coupon_code);
          } catch (couponError) {
            console.error('⚠️ Failed to increment coupon usage:', couponError);
            // Don't fail the webhook for coupon errors
          }
        }

        // Initialize program progress (Sprint 4 Enhancement)
        // Count total modules and lessons
        const statsResult = await sql\`
          SELECT
            COUNT(DISTINCT pm.id) as total_modules,
            COUNT(DISTINCT l.id) as total_lessons
          FROM program_modules pm
          LEFT JOIN lessons l ON l.module_id = pm.id AND l.is_published = true
          WHERE pm.program_id = \${transaction.program_id}
            AND pm.is_published = true
        \`;

        const { total_modules, total_lessons } = statsResult.rows[0];

        // Find first lesson as current lesson
        const firstLessonResult = await sql\`
          SELECT l.id
          FROM lessons l
          JOIN program_modules pm ON l.module_id = pm.id
          WHERE pm.program_id = \${transaction.program_id}
            AND pm.is_published = true
            AND l.is_published = true
          ORDER BY pm.display_order, l.display_order
          LIMIT 1
        \`;

        const currentLessonId = firstLessonResult.rows[0]?.id || null;

        // Initialize user_program_progress
        await sql\`
          INSERT INTO user_program_progress (
            user_id, program_id,
            started_at, total_modules, total_lessons,
            overall_progress_percentage,
            current_lesson_id
          ) VALUES (
            \${transaction.user_id},
            \${transaction.program_id},
            NOW(),
            \${total_modules},
            \${total_lessons},
            0,
            \${currentLessonId}
          )
          ON CONFLICT (user_id, program_id) DO UPDATE SET
            total_modules = \${total_modules},
            total_lessons = \${total_lessons},
            current_lesson_id = COALESCE(user_program_progress.current_lesson_id, \${currentLessonId})
        \`;

        console.log('✅ Payment completed, enrollment created, and progress initialized');
        console.log(\`📊 Program stats: \${total_modules} modules, \${total_lessons} lessons\`);
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
