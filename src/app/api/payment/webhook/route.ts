import { NextRequest, NextResponse } from 'next/server';
import { sql, db } from '@vercel/postgres';
import { stripe, constructStripeEvent } from '@/lib/stripe';
import type Stripe from 'stripe';
import { logger } from '@/lib/logger';

// Tier hierarchy for subscription_type sync: only promote, never demote.
const SLUG_TIER: Record<string, number> = {
  free: 0, kickstart: 1, transformatie: 2, vip: 3,
  sociaal: 1, core: 2, pro: 3, premium: 4,
};
function slugTier(slug: string): number {
  return SLUG_TIER[slug?.toLowerCase()] ?? 0;
}

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
  // Crash at module load time so the deploy fails loudly rather than silently accepting unsigned events.
  throw new Error('FATAL: STRIPE_WEBHOOK_SECRET is not set in production. Refusing to start.');
}

/**
 * POST /api/payment/webhook
 * Stripe webhook handler — called by Stripe on payment status changes.
 *
 * Supported events:
 *   checkout.session.completed   → fulfill order (subscription or program)
 *   checkout.session.expired     → mark as cancelled
 *   payment_intent.payment_failed → mark as failed
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  // ── Signature verification ────────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    if (!WEBHOOK_SECRET) {
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
      event = JSON.parse(rawBody) as Stripe.Event;
    } else {
      event = constructStripeEvent(rawBody, signature, WEBHOOK_SECRET);
    }
  } catch (err) {
    console.error('❌ Stripe webhook signature invalid:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  logger.log(`📞 Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        await handleSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        logger.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('💥 Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' });
}

// ─── Handlers ──────────────────────────────────────────────────────────────

async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const { payment_type, order_id } = meta;

  if (!order_id) {
    console.error('❌ Webhook missing order_id in metadata');
    return;
  }

  if (payment_type === 'subscription') {
    await fulfillSubscription(session, meta);
  } else if (payment_type === 'program') {
    await fulfillProgram(session, meta);
  } else {
    console.warn('⚠️ Unknown payment_type in metadata:', payment_type);
  }
}

async function handleSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) return;

  // Try both tables
  await sql`
    UPDATE payment_transactions SET status = 'cancelled', updated_at = NOW()
    WHERE order_id = ${orderId} AND status = 'pending'
  `.catch(() => null);

  await sql`
    UPDATE orders SET status = 'cancelled', updated_at = NOW()
    WHERE id = ${orderId} AND status = 'pending'
  `.catch(() => null);

  logger.log('❌ Session expired, order cancelled:', orderId);
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.order_id;
  if (!orderId) return;

  await sql`
    UPDATE payment_transactions SET status = 'failed', updated_at = NOW()
    WHERE order_id = ${orderId}
  `.catch(() => null);

  await sql`
    UPDATE orders SET status = 'failed', updated_at = NOW()
    WHERE id = ${orderId}
  `.catch(() => null);

  logger.log('❌ Payment failed for order:', orderId);
}

// ─── Fulfillment: subscription package ─────────────────────────────────────

async function fulfillSubscription(
  session: Stripe.Checkout.Session,
  meta: Record<string, string>
) {
  const { order_id, user_id, package_type, billing_period, coupon_code } = meta;
  const userId = parseInt(user_id, 10);
  const amountPaid = (session.amount_total ?? 0) / 100;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // IDEMPOTENCY: lock the row so concurrent webhook replays wait here.
    const existing = await client.query(
      `SELECT status FROM orders WHERE id = $1 LIMIT 1 FOR UPDATE`,
      [order_id]
    );
    if (existing.rows[0]?.status === 'completed') {
      await client.query('ROLLBACK');
      logger.log('ℹ️ Subscription order already completed, skipping');
      return;
    }

    await client.query(
      `UPDATE orders SET status = 'completed', paid_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [order_id]
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  // Outside the transaction: subscription activation and side-effects
  const { createOrUpdateSubscription } = await import('@/lib/neon-subscription');
  await createOrUpdateSubscription(userId, {
    packageType: package_type as any,
    billingPeriod: billing_period as any,
    status: 'active',
    orderId: order_id,
    startDate: new Date().toISOString(),
    amount: amountPaid,
  });

  if (coupon_code) {
    await sql`
      UPDATE coupons
      SET used_count = used_count + 1, updated_at = NOW()
      WHERE UPPER(code) = ${coupon_code}
      AND (used_count < max_uses OR max_uses IS NULL)
    `.catch((e: unknown) => console.error('⚠️ Coupon increment failed:', e));
  }

  logger.log(`✅ Subscription activated: ${package_type} (${billing_period}) for user ${userId}`);
}

// ─── Fulfillment: one-time program purchase ─────────────────────────────────

async function fulfillProgram(
  session: Stripe.Checkout.Session,
  meta: Record<string, string>
) {
  const {
    order_id,
    user_id,
    program_id,
    program_slug,
    coupon_code,
    referral_code,
  } = meta;
  const userId = parseInt(user_id, 10);
  const programIdInt = parseInt(program_id, 10);

  // Atomic: lock the row so concurrent webhook replays wait. If already completed, skip.
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT status FROM payment_transactions WHERE order_id = $1 LIMIT 1 FOR UPDATE`,
      [order_id]
    );
    if (existing.rows[0]?.status === 'completed') {
      await client.query('ROLLBACK');
      logger.log('ℹ️ Program transaction already completed, skipping');
      return;
    }

    await client.query(
      `UPDATE payment_transactions SET status = 'completed', paid_at = NOW(), updated_at = NOW() WHERE order_id = $1`,
      [order_id]
    );

    await client.query(
      `INSERT INTO program_enrollments (user_id, program_id, order_id, status, enrolled_at)
       VALUES ($1, $2, $3, 'active', NOW())
       ON CONFLICT (user_id, program_id, order_id) DO NOTHING`,
      [userId, programIdInt, order_id]
    );

    // Only promote subscription_type — never demote to a lower tier.
    if (program_slug) {
      await client.query(
        `UPDATE users
         SET subscription_type = $1, updated_at = NOW()
         WHERE id = $2
           AND (subscription_type IS NULL
                OR subscription_type NOT IN (SELECT unnest($3::text[])))`,
        [
          program_slug,
          userId,
          // slugs that are HIGHER than the incoming one — don't overwrite those
          Object.entries(SLUG_TIER)
            .filter(([, tier]) => tier > slugTier(program_slug))
            .map(([s]) => s),
        ]
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  logger.log('✅ Enrollment created');

  // Increment coupon usage
  if (coupon_code) {
    await sql`
      UPDATE coupons
      SET used_count = used_count + 1, updated_at = NOW()
      WHERE UPPER(code) = ${coupon_code}
      AND (used_count < max_uses OR max_uses IS NULL)
    `.catch((e: unknown) => console.error('⚠️ Coupon increment failed:', e));
  }

  // Initialize program progress
  await initializeProgramProgress(userId, programIdInt, program_slug);

  // Send enrollment confirmation email
  try {
    const userResult = await sql`SELECT name, email FROM users WHERE id = ${userId} LIMIT 1`;
    const programResult = await sql`SELECT name, slug FROM programs WHERE id = ${programIdInt} LIMIT 1`;

    if (userResult.rows.length > 0 && programResult.rows.length > 0) {
      const { name, email } = userResult.rows[0];
      const { name: programName, slug } = programResult.rows[0];
      const dayOneUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000'}/${slug}/dag/1`;

      const { sendProgramEnrollmentEmail } = await import('@/lib/email-service');
      await sendProgramEnrollmentEmail(email, name, programName, slug, dayOneUrl);
      logger.log('✅ Enrollment email sent to:', email);
    }
  } catch (e) {
    console.error('⚠️ Enrollment email failed (non-fatal):', e);
  }

  // Register affiliate conversion
  if (referral_code) {
    await registerAffiliateConversion(order_id, userId, referral_code).catch((e: unknown) =>
      console.error('⚠️ Affiliate conversion failed (non-fatal):', e)
    );
  }

  logger.log('✅ Program fulfilled:', order_id);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function initializeProgramProgress(
  userId: number,
  programId: number,
  programSlug: string
) {
  try {
    // Kickstart: day-based progress
    if (programSlug === 'kickstart') {
      const daysResult = await sql`
        SELECT id, dag_nummer FROM program_days
        WHERE program_id = ${programId} ORDER BY dag_nummer
      `;
      for (const day of daysResult.rows) {
        const status = day.dag_nummer === 1 ? 'available' : 'locked';
        await sql`
          INSERT INTO user_day_progress (user_id, program_id, day_id, status)
          VALUES (${userId}, ${programId}, ${day.id}, ${status})
          ON CONFLICT (user_id, day_id) DO NOTHING
        `;
      }

      // Schedule Kickstart → Transformatie upsell
      try {
        const { scheduleKickstartUpsellSequence } = await import('@/lib/kickstart-upsell-service');
        await scheduleKickstartUpsellSequence({
          userId,
          purchaseDate: new Date(),
          kickstartOrderId: '',
        });
      } catch (e) {
        console.error('⚠️ Upsell schedule failed (non-fatal):', e);
      }
      return;
    }

    // Transformatie: cancel Kickstart upsell sequence
    if (programSlug === 'transformatie') {
      try {
        const { cancelKickstartUpsellSequence } = await import('@/lib/kickstart-upsell-service');
        await cancelKickstartUpsellSequence(userId);
      } catch (e) {
        console.error('⚠️ Cancel upsell sequence failed (non-fatal):', e);
      }
    }

    // Standard module/lesson progress
    const statsResult = await sql`
      SELECT
        COUNT(DISTINCT pm.id) AS total_modules,
        COUNT(DISTINCT l.id)  AS total_lessons
      FROM program_modules pm
      LEFT JOIN lessons l ON l.module_id = pm.id AND l.is_published = true
      WHERE pm.program_id = ${programId} AND pm.is_published = true
    `;
    const { total_modules, total_lessons } = statsResult.rows[0];

    const firstLesson = await sql`
      SELECT l.id
      FROM lessons l
      JOIN program_modules pm ON l.module_id = pm.id
      WHERE pm.program_id = ${programId}
        AND pm.is_published = true AND l.is_published = true
      ORDER BY pm.display_order, l.display_order
      LIMIT 1
    `;
    const currentLessonId = firstLesson.rows[0]?.id ?? null;

    await sql`
      INSERT INTO user_program_progress (
        user_id, program_id, started_at, total_modules, total_lessons,
        overall_progress_percentage, current_lesson_id
      ) VALUES (
        ${userId}, ${programId}, NOW(), ${total_modules}, ${total_lessons}, 0, ${currentLessonId}
      )
      ON CONFLICT (user_id, program_id) DO UPDATE SET
        total_modules    = ${total_modules},
        total_lessons    = ${total_lessons},
        current_lesson_id = COALESCE(user_program_progress.current_lesson_id, ${currentLessonId})
    `;
    logger.log(`📊 Progress initialized: ${total_modules} modules, ${total_lessons} lessons`);
  } catch (e) {
    console.error('⚠️ Progress initialization failed (non-fatal):', e);
  }
}

async function registerAffiliateConversion(
  orderId: string,
  userId: number,
  referralCode: string
) {
  const affResult = await sql`
    SELECT pt.amount, ap.id AS partner_id, ap.commission_pct
    FROM payment_transactions pt
    JOIN affiliate_partners ap ON ap.referral_code = ${referralCode} AND ap.status = 'active'
    WHERE pt.order_id = ${orderId}
    LIMIT 1
  `;
  if (affResult.rows.length === 0) return;

  const aff = affResult.rows[0];
  const commissionAmt = parseFloat(aff.amount) * (parseFloat(aff.commission_pct) / 100);

  await sql`
    INSERT INTO affiliate_conversions (
      partner_id, referral_code, order_id, user_id,
      sale_amount, commission_pct, commission_amt,
      status, converted_at
    ) VALUES (
      ${aff.partner_id}, ${referralCode}, ${orderId}, ${userId},
      ${aff.amount}, ${aff.commission_pct}, ${commissionAmt},
      'pending', NOW()
    )
    ON CONFLICT DO NOTHING
  `;
  logger.log('✅ Affiliate conversion registered:', referralCode);
}
