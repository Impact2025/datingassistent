import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MULTISAFEPAY_API_KEY = process.env.MULTISAFEPAY_API_KEY || '';
const MULTISAFEPAY_ENVIRONMENT = process.env.MULTISAFEPAY_ENVIRONMENT || 'test';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000';

export async function POST(request: NextRequest) {
  try {
    // Use centralized auth function
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
    const { programId, programSlug, amount, couponCode } = body;

    // Validate required fields (amount can be 0 for free/fully discounted orders)
    if (!programId || !programSlug || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedCouponCode = couponCode?.trim()?.toUpperCase() || null;

    const programResult = await sql`
      SELECT * FROM programs WHERE id = ${programId} LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const program = programResult.rows[0];
    const timestamp = Date.now();
    const orderId = 'ORDER-' + timestamp + '-' + userId + '-' + programId;

    // Handle free orders (100% discount or free program)
    if (amount === 0) {
      console.log('🎁 Free order detected, creating direct enrollment');

      // Check if user already has an enrollment for this program
      const existingEnrollment = await sql`
        SELECT id, order_id, status FROM program_enrollments
        WHERE user_id = ${userId} AND program_id = ${programId}
        LIMIT 1
      `;

      if (existingEnrollment.rows.length > 0) {
        const enrollment = existingEnrollment.rows[0];
        console.log('ℹ️ User already enrolled in this program:', enrollment);

        // Return success with existing enrollment
        return NextResponse.json({
          success: true,
          order_id: enrollment.order_id,
          payment_url: `${BASE_URL}/payment/success?order_id=${enrollment.order_id}`,
          message: 'Je bent al ingeschreven voor dit programma'
        });
      }

      // Create payment transaction with completed status
      await sql`
        INSERT INTO payment_transactions (
          order_id, user_id, program_id, amount, currency,
          status, payment_method, coupon_code, created_at, paid_at
        ) VALUES (
          ${orderId}, ${userId}, ${programId}, ${amount}, 'EUR',
          'completed', 'free', ${normalizedCouponCode}, NOW(), NOW()
        )
      `;

      // Create program enrollment
      await sql`
        INSERT INTO program_enrollments (
          user_id, program_id, order_id, status, enrolled_at
        ) VALUES (
          ${userId}, ${programId}, ${orderId}, 'active', NOW()
        )
      `;

      // Increment coupon usage if coupon was used
      if (normalizedCouponCode) {
        try {
          await sql`
            UPDATE coupons
            SET used_count = used_count + 1, updated_at = NOW()
            WHERE UPPER(code) = ${normalizedCouponCode}
            AND (used_count < max_uses OR max_uses IS NULL)
          `;
          console.log('✅ Coupon usage incremented:', normalizedCouponCode);
        } catch (couponError) {
          console.error('⚠️ Failed to increment coupon usage:', couponError);
        }
      }

      // Send enrollment email
      try {
        const { sendProgramEnrollmentEmail } = await import('@/lib/email-service');
        const dayOneUrl = `${BASE_URL}/${programSlug}/dag/1`;
        await sendProgramEnrollmentEmail(
          dbUser.email,
          dbUser.name,
          program.name,
          programSlug,
          dayOneUrl
        );
        console.log('✅ Free enrollment email sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send enrollment email:', emailError);
      }

      console.log('✅ Free order completed:', orderId);

      // Redirect directly to success page
      return NextResponse.json({
        success: true,
        order_id: orderId,
        payment_url: `${BASE_URL}/payment/success?order_id=${orderId}`
      });
    }

    const multiSafePayUrl = MULTISAFEPAY_ENVIRONMENT === 'live'
      ? 'https://api.multisafepay.com/v1/json/orders'
      : 'https://testapi.multisafepay.com/v1/json/orders';

    const payload = {
      type: 'redirect',
      order_id: orderId,
      currency: 'EUR',
      amount: Math.round(amount * 100),
      description: 'DatingAssistent - ' + program.name,
      payment_options: {
        notification_url: BASE_URL + '/api/payment/webhook',
        redirect_url: BASE_URL + '/payment/success?order_id=' + orderId,
        cancel_url: BASE_URL + '/payment/cancelled?order_id=' + orderId,
        close_window: false
      },
      customer: {
        locale: 'nl_NL',
        email: dbUser.email,
        firstname: dbUser.name?.split(' ')[0] || '',
        lastname: dbUser.name?.split(' ').slice(1).join(' ') || '',
        country: 'NL'
      },
      custom_info: {
        custom_1: userId.toString(),
        custom_2: programId.toString(),
        custom_3: programSlug
      }
    };

    // Check if API key is configured
    if (!MULTISAFEPAY_API_KEY) {
      console.error('❌ MULTISAFEPAY_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    console.log('Creating MultiSafePay order:', orderId);
    console.log('Environment:', MULTISAFEPAY_ENVIRONMENT);
    console.log('API URL:', multiSafePayUrl);

    const response = await fetch(multiSafePayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MULTISAFEPAY_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('MultiSafePay response status:', response.status);

    if (!response.ok) {
      console.error('MultiSafePay error response:', responseText);
      return NextResponse.json(
        { error: 'Payment provider error', details: responseText },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse MultiSafePay response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from payment provider' },
        { status: 500 }
      );
    }

    if (!data.success || !data.data) {
      console.error('MultiSafePay unsuccessful:', data);
      return NextResponse.json(
        { error: 'Payment creation failed', details: data.error_info || data },
        { status: 500 }
      );
    }

    const paymentUrl = data.data.payment_url;

    await sql`
      INSERT INTO payment_transactions (
        order_id, user_id, program_id, amount, currency,
        status, payment_method, coupon_code, created_at
      ) VALUES (
        ${orderId}, ${userId}, ${programId}, ${amount}, 'EUR',
        'pending', 'multisafepay', ${normalizedCouponCode}, NOW()
      )
    `;

    console.log('Payment created:', orderId);

    return NextResponse.json({
      success: true,
      order_id: orderId,
      payment_url: paymentUrl
    });

  } catch (error) {
    console.error('💥 Payment creation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
