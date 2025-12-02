import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const MULTISAFEPAY_API_KEY = process.env.MULTISAFEPAY_API_KEY || '';
const MULTISAFEPAY_ENVIRONMENT = process.env.MULTISAFEPAY_ENVIRONMENT || 'test';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('datespark_auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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

    console.log('Creating MultiSafePay order:', orderId);

    const response = await fetch(multiSafePayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MULTISAFEPAY_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MultiSafePay error:', errorText);
      throw new Error('MultiSafePay API error');
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error('MultiSafePay response error');
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
