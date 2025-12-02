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

    const user = userResult.rows[0];
    const body = await request.json();
    const { programId, programSlug, amount, couponCode } = body;

    if (!programId || !programSlug || !amount) {
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
        email: user.email,
        firstname: user.name?.split(' ')[0] || '',
        lastname: user.name?.split(' ').slice(1).join(' ') || '',
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
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
