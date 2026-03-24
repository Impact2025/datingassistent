/**
 * Refund Eligibility Check
 *
 * Enforces the guarantee's activity threshold:
 * "Geld terug als je minimaal 7 van de 14 dagen actief bent geweest
 *  en Iris jou niet beter begrijpt dan jij jezelf begrijpt."
 *
 * A user is eligible for a refund when:
 * 1. Their enrollment is between 1-14 days old (refund window)
 * 2. They have logged in on at least 7 distinct days since enrollment
 *    (prevents casual buyers from using the product zero days and refunding)
 *
 * GET /api/payment/refund-eligibility?orderId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

interface EligibilityResult {
  eligible: boolean;
  reason: string;
  activeDays: number;
  requiredDays: number;
  daysInWindow: number;
  windowDays: number;
  orderId: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<EligibilityResult | { error: string }>> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const orderId = request.nextUrl.searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ error: 'orderId vereist' }, { status: 400 });
  }

  const userId = Number(user.id);

  // 1. Verify the order belongs to this user and is within the 14-day window
  const orderResult = await sql`
    SELECT
      pt.order_id,
      pt.paid_at,
      EXTRACT(DAY FROM NOW() - pt.paid_at)::int AS days_since_payment
    FROM payment_transactions pt
    WHERE pt.order_id = ${orderId}
      AND pt.user_id = ${userId}
      AND pt.status = 'completed'
    LIMIT 1
  `;

  if (orderResult.rows.length === 0) {
    return NextResponse.json({ error: 'Bestelling niet gevonden' }, { status: 404 });
  }

  const order = orderResult.rows[0];
  const daysInWindow = order.days_since_payment as number;
  const WINDOW_DAYS = 14;
  const REQUIRED_ACTIVE_DAYS = 7;

  // 2. Check if still in refund window
  if (daysInWindow > WINDOW_DAYS) {
    return NextResponse.json({
      eligible: false,
      reason: `De garantieperiode van ${WINDOW_DAYS} dagen is verlopen (${daysInWindow} dagen geleden gekocht).`,
      activeDays: 0,
      requiredDays: REQUIRED_ACTIVE_DAYS,
      daysInWindow,
      windowDays: WINDOW_DAYS,
      orderId,
    });
  }

  // 3. Count distinct active days since payment
  const activityResult = await sql`
    SELECT COUNT(DISTINCT DATE(created_at))::int AS active_days
    FROM user_activity_log
    WHERE user_id = ${userId}
      AND created_at >= ${order.paid_at}
  `;

  const activeDays = activityResult.rows[0]?.active_days ?? 0;

  // 4. Determine eligibility
  if (activeDays < REQUIRED_ACTIVE_DAYS) {
    return NextResponse.json({
      eligible: false,
      reason: `Je hebt het programma op ${activeDays} van de ${REQUIRED_ACTIVE_DAYS} vereiste dagen gebruikt. De garantie geldt voor gebruikers die het serieus hebben geprobeerd.`,
      activeDays,
      requiredDays: REQUIRED_ACTIVE_DAYS,
      daysInWindow,
      windowDays: WINDOW_DAYS,
      orderId,
    });
  }

  return NextResponse.json({
    eligible: true,
    reason: `Je hebt het programma op ${activeDays} dagen gebruikt en valt binnen de garantieperiode. Je kunt een terugbetaling aanvragen.`,
    activeDays,
    requiredDays: REQUIRED_ACTIVE_DAYS,
    daysInWindow,
    windowDays: WINDOW_DAYS,
    orderId,
  });
}
