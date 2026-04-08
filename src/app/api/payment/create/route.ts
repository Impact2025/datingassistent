import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;

    const userResult = await sql`
      SELECT id, email, name FROM users WHERE id = ${userId} LIMIT 1
    `;
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const dbUser = userResult.rows[0];

    const body = await request.json();
    const {
      // Program purchase params
      programId,
      programSlug,
      // Subscription package params
      packageType,
      billingPeriod,
      // Shared
      amount,
      couponCode,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    const referralCode = request.cookies.get('da_ref')?.value || null;
    const normalizedCouponCode = couponCode?.trim()?.toUpperCase() || null;

    const isSubscription = !!(packageType && billingPeriod);
    const isProgram = !!(programId && programSlug);

    if (!isSubscription && !isProgram) {
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
    }
    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const timestamp = Date.now();

    // ─── SUBSCRIPTION PACKAGE FLOW ────────────────────────────────────────────
    if (isSubscription) {
      const orderId = `ORDER-${timestamp}-${userId}-${packageType}`;
      // amount arrives in cents from the checkout UI (getPackagePrice returns cents)
      const amountCents = Math.round(amount);

      // Free package (100% coupon)
      if (amountCents === 0) {
        await sql`
          INSERT INTO orders (
            id, user_id, package_type, billing_period, amount, currency,
            status, payment_provider, coupon_code, created_at, updated_at
          ) VALUES (
            ${orderId}, ${userId}, ${packageType}, ${billingPeriod}, 0, 'EUR',
            'completed', 'stripe', ${normalizedCouponCode}, NOW(), NOW()
          )
          ON CONFLICT DO NOTHING
        `;

        const { createOrUpdateSubscription } = await import('@/lib/neon-subscription');
        await createOrUpdateSubscription(userId, {
          packageType,
          billingPeriod,
          status: 'active',
          orderId,
          startDate: new Date().toISOString(),
          amount: 0,
        });

        return NextResponse.json({
          success: true,
          order_id: orderId,
          payment_url: `${BASE_URL}/payment/success?order_id=${orderId}`,
          paymentUrl: `${BASE_URL}/payment/success?order_id=${orderId}`,
        });
      }

      const packageName = packageType.charAt(0).toUpperCase() + packageType.slice(1);
      const periodLabel = billingPeriod === 'yearly' ? 'jaarlijks' : 'maandelijks';

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        locale: 'nl',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: amountCents,
              product_data: {
                name: `DatingAssistent ${packageName} (${periodLabel})`,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: dbUser.email,
        success_url: `${BASE_URL}/payment/success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/payment/cancelled?order_id=${orderId}`,
        metadata: {
          payment_type: 'subscription',
          order_id: orderId,
          user_id: userId.toString(),
          package_type: packageType,
          billing_period: billingPeriod,
          coupon_code: normalizedCouponCode || '',
        },
      });

      await sql`
        INSERT INTO orders (
          id, user_id, package_type, billing_period, amount, currency,
          status, payment_provider, stripe_session_id, coupon_code,
          created_at, updated_at
        ) VALUES (
          ${orderId}, ${userId}, ${packageType}, ${billingPeriod},
          ${amountCents}, 'EUR', 'pending', 'stripe', ${session.id},
          ${normalizedCouponCode}, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `;

      console.log('✅ Stripe subscription session created:', orderId);

      return NextResponse.json({
        success: true,
        order_id: orderId,
        payment_url: session.url,
        paymentUrl: session.url,
      });
    }

    // ─── PROGRAM PURCHASE FLOW ────────────────────────────────────────────────
    const programResult = await sql`
      SELECT * FROM programs WHERE id = ${programId} LIMIT 1
    `;
    if (programResult.rows.length === 0) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }
    const program = programResult.rows[0];
    const orderId = `ORDER-${timestamp}-${userId}-${programId}`;
    // amount arrives in euros from the program checkout
    const amountEuros = amount;
    const amountCents = Math.round(amountEuros * 100);

    // Free order (100% coupon or free program)
    if (amountCents === 0) {
      console.log('🎁 Free order detected, creating direct enrollment');

      const existingEnrollment = await sql`
        SELECT id, order_id, status FROM program_enrollments
        WHERE user_id = ${userId} AND program_id = ${programId}
        LIMIT 1
      `;
      if (existingEnrollment.rows.length > 0) {
        const enrollment = existingEnrollment.rows[0];
        return NextResponse.json({
          success: true,
          order_id: enrollment.order_id,
          payment_url: `${BASE_URL}/payment/success?order_id=${enrollment.order_id}`,
          paymentUrl: `${BASE_URL}/payment/success?order_id=${enrollment.order_id}`,
          message: 'Je bent al ingeschreven voor dit programma',
        });
      }

      await sql`
        INSERT INTO payment_transactions (
          order_id, user_id, program_id, amount, currency,
          status, payment_method, coupon_code,
          utm_source, utm_medium, utm_campaign, referral_code,
          created_at, paid_at
        ) VALUES (
          ${orderId}, ${userId}, ${programId}, ${amountEuros}, 'EUR',
          'completed', 'free', ${normalizedCouponCode},
          ${utmSource || null}, ${utmMedium || null}, ${utmCampaign || null}, ${referralCode},
          NOW(), NOW()
        )
      `;

      await sql`
        INSERT INTO program_enrollments (user_id, program_id, order_id, status, enrolled_at)
        VALUES (${userId}, ${programId}, ${orderId}, 'active', NOW())
      `;

      if (normalizedCouponCode) {
        await sql`
          UPDATE coupons
          SET used_count = used_count + 1, updated_at = NOW()
          WHERE UPPER(code) = ${normalizedCouponCode}
          AND (used_count < max_uses OR max_uses IS NULL)
        `.catch((e: unknown) => console.error('⚠️ Coupon increment failed:', e));
      }

      try {
        const { sendProgramEnrollmentEmail } = await import('@/lib/email-service');
        await sendProgramEnrollmentEmail(
          dbUser.email,
          dbUser.name,
          program.name,
          programSlug,
          `${BASE_URL}/${programSlug}/dag/1`
        );
      } catch (e) {
        console.error('⚠️ Free enrollment email failed:', e);
      }

      return NextResponse.json({
        success: true,
        order_id: orderId,
        payment_url: `${BASE_URL}/payment/success?order_id=${orderId}`,
        paymentUrl: `${BASE_URL}/payment/success?order_id=${orderId}`,
      });
    }

    // Paid program — create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'nl',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: {
              name: `DatingAssistent - ${program.name}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: dbUser.email,
      success_url: `${BASE_URL}/payment/success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/payment/cancelled?order_id=${orderId}`,
      metadata: {
        payment_type: 'program',
        order_id: orderId,
        user_id: userId.toString(),
        program_id: programId.toString(),
        program_slug: programSlug,
        coupon_code: normalizedCouponCode || '',
        referral_code: referralCode || '',
        utm_source: utmSource || '',
        utm_medium: utmMedium || '',
        utm_campaign: utmCampaign || '',
      },
    });

    await sql`
      INSERT INTO payment_transactions (
        order_id, user_id, program_id, amount, currency,
        status, payment_method, stripe_session_id, coupon_code,
        utm_source, utm_medium, utm_campaign, referral_code,
        created_at
      ) VALUES (
        ${orderId}, ${userId}, ${programId}, ${amountEuros}, 'EUR',
        'pending', 'stripe', ${session.id}, ${normalizedCouponCode},
        ${utmSource || null}, ${utmMedium || null}, ${utmCampaign || null}, ${referralCode},
        NOW()
      )
    `;

    console.log('✅ Stripe program session created:', orderId);

    return NextResponse.json({
      success: true,
      order_id: orderId,
      payment_url: session.url,
      paymentUrl: session.url,
    });
  } catch (error) {
    console.error('💥 Payment creation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create payment',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
