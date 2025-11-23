import { NextResponse } from 'next/server';
import { createMultiSafePayOrder } from '@/lib/multisafepay';
import { sql } from '@vercel/postgres';
import { incrementCouponUsage } from '@/lib/coupon-service';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Note: CSRF protection is globally disabled in middleware
    // If you want to re-enable it, update src/lib/csrf-edge.ts getCSRFConfig()

    const body = await request.json();
    const { 
      packageType, 
      billingPeriod, 
      amount, 
      userId, 
      userEmail,
      couponCode,
      redirectAfterPayment,
      customerName,
      customerLocale
    } = body;

    console.log('💳 Creating payment order:', {
      packageType,
      billingPeriod,
      amount,
      userId,
      userEmail,
      couponCode,
      redirectAfterPayment,
      customerName,
      customerLocale
    });

    // Validate required fields
    if (!packageType || !billingPeriod || amount === undefined || amount === null || !userEmail) {
      console.error('❌ Missing required fields:', {
        packageType: !!packageType,
        billingPeriod: !!billingPeriod,
        amountProvided: amount,
        userEmail: !!userEmail
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (billingPeriod !== 'monthly' && billingPeriod !== 'yearly') {
      console.error('❌ Invalid billing period supplied:', billingPeriod);
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    if (!Number.isInteger(amount)) {
      console.error('❌ Amount must be an integer (cents):', amount);
      return NextResponse.json({ error: 'Invalid amount for payment' }, { status: 400 });
    }

    if (amount < 0) {
      console.error('❌ Amount cannot be negative:', amount);
      return NextResponse.json({ error: 'Invalid amount for payment' }, { status: 400 });
    }

    // If userId is 'temp', we'll create a temporary one
    const actualUserId = userId === 'temp' ? null : userId;

    // Create unique order ID (DA-timestamp-random)
    const randomId = Math.random().toString(36).substring(2, 10);
    const orderId = `DA-${Date.now()}-${randomId}`;

    console.log('📦 Generated order ID:', orderId);

    const baseUrl = resolveBaseUrl(request);
    const normalizedLocale = typeof customerLocale === 'string' && customerLocale.trim().length > 0 ? customerLocale : 'nl_NL';
    const fullName = typeof customerName === 'string' ? customerName.trim() : '';
    const [firstName, ...rest] = fullName.split(/\s+/).filter(Boolean);
    const lastName = rest.join(' ');

    if (amount === 0) {
      await sql`
        INSERT INTO orders (
          id, user_id, package_type, billing_period, amount, currency,
          status, payment_provider, linked_to_user, customer_email
        ) VALUES (
          ${orderId}, ${actualUserId}, ${packageType}, ${billingPeriod}, ${amount}, 'EUR',
          'paid', 'none', true, ${userEmail}
        )
      `;

      console.log('✅ Gratis bestelling aangemaakt zonder MultiSafepay:', orderId);

      return NextResponse.json({
        success: true,
        orderId,
        paymentUrl: `${baseUrl}/payment/success?order_id=${orderId}&free=1`,
      });
    }

    // Create order in MultiSafepay
    const orderResult = await createMultiSafePayOrder({
      type: 'redirect',
      order_id: orderId,
      currency: 'EUR',
      amount: amount,
      description: `Dating Assistent ${packageType} ${billingPeriod} subscription`,
      payment_options: {
        notification_url: `${baseUrl}/api/payment/webhook`,
        redirect_url: `${baseUrl}/payment/success?order_id=${orderId}`,
        cancel_url: `${baseUrl}/payment/cancelled`,
      },
      customer: {
        locale: normalizedLocale,
        email: userEmail,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      },
    });

    if (!orderResult.success) {
      console.error('❌ MultiSafePay order creation failed:', orderResult.error_info);
      return NextResponse.json({ error: 'Failed to create payment order', details: orderResult.error_info }, { status: 500 });
    }

    console.log('✅ MultiSafePay order created:', {
      orderId: orderResult.data?.order_id,
      transactionId: orderResult.data?.transaction_id
    });

    // Store order in database
    await sql`
      INSERT INTO orders (
        id, user_id, package_type, billing_period, amount, currency,
        status, payment_provider, linked_to_user, customer_email
      ) VALUES (
        ${orderId}, ${actualUserId}, ${packageType}, ${billingPeriod}, ${amount}, 'EUR',
        'initialized', 'multisafepay', false, ${userEmail}
      )
    `;

    console.log('💾 Order saved to database:', orderId);

    // If coupon was used, increment usage count
    if (couponCode) {
      try {
        // Get coupon to increment usage
        const couponResult = await sql`
          SELECT id, used_count, max_uses FROM coupons 
          WHERE code = ${couponCode} AND is_active = true
        `;
        
        if (couponResult.rows.length > 0) {
          const coupon = couponResult.rows[0];
          
          // Check if coupon still has uses left
          if (!coupon.max_uses || coupon.used_count < coupon.max_uses) {
            // Increment usage count
            await incrementCouponUsage(coupon.id);
            console.log('🏷️ Coupon usage incremented:', couponCode);
          } else {
            console.warn('⚠️ Coupon max usage reached:', couponCode);
          }
        } else {
          console.warn('⚠️ Coupon not found:', couponCode);
        }
      } catch (couponError) {
        console.error('❌ Error updating coupon usage:', couponError);
        // Don't fail the payment if coupon update fails
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: orderResult.data?.payment_url,
    });
  } catch (error) {
    console.error('❌ Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function resolveBaseUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;

  if (envUrl) {
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
    return `https://${envUrl}`;
  }

  try {
    const currentUrl = new URL(request.url);
    return currentUrl.origin;
  } catch (err) {
    console.error('⚠️ Unable to resolve base URL from request, defaulting to http://localhost:9002', err);
    return 'http://localhost:9002';
  }
}