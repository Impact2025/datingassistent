import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getPackagePrice } from '@/lib/multisafepay';
import { PackageType } from '@/lib/subscription';
import { verifyCSRF } from '@/lib/csrf-edge';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfValid = await verifyCSRF(request);
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const { userId, newPlan, billingPeriod = 'yearly' } = await request.json();

    if (!userId || !newPlan) {
      return NextResponse.json(
        { error: 'User ID and new plan are required' },
        { status: 400 }
      );
    }

    // Get current user subscription
    const userResult = await sql`
      SELECT subscription_type, subscription_status, subscription_end_date
      FROM users
      WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentUser = userResult.rows[0];
    const currentPlan = currentUser.subscription_type;
    const newPackageType = newPlan as PackageType;

    // Validate new plan exists
    const newPrice = getPackagePrice(newPackageType, billingPeriod as 'monthly' | 'yearly');

    // Calculate proration if upgrading mid-cycle
    let proratedAmount = newPrice;
    let upgradeMessage = '';

    if (currentUser.subscription_end_date && currentUser.subscription_status === 'active') {
      const endDate = new Date(currentUser.subscription_end_date);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      if (daysRemaining > 0) {
        // Calculate daily rate and prorate
        const currentPrice = getPackagePrice(currentPlan as PackageType, billingPeriod as 'monthly' | 'yearly');
        const dailyCurrentRate = currentPrice / (billingPeriod === 'yearly' ? 365 : 30);
        const dailyNewRate = newPrice / (billingPeriod === 'yearly' ? 365 : 30);

        const unusedCredit = dailyCurrentRate * daysRemaining;
        proratedAmount = (dailyNewRate * daysRemaining) - unusedCredit;

        upgradeMessage = `Upgrade naar ${newPlan} - €${(proratedAmount / 100).toFixed(2)} eenmalig voor resterende ${daysRemaining} dagen`;
      }
    }

    // Create upgrade order
    const orderResult = await sql`
      INSERT INTO orders (
        user_id,
        package_type,
        billing_period,
        amount,
        currency,
        status,
        payment_provider,
        created_at
      ) VALUES (
        ${userId},
        ${newPlan},
        ${billingPeriod},
        ${proratedAmount},
        'EUR',
        'pending',
        'multisafepay',
        NOW()
      )
      RETURNING id
    `;

    const orderId = orderResult.rows[0].id;

    // Create payment order via MultiSafePay
    const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(userId),
        packageType: newPackageType,
        billingPeriod: billingPeriod as 'monthly' | 'yearly',
        amount: proratedAmount,
        isUpgrade: true,
        orderId
      }),
    });

    if (!paymentResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 500 }
      );
    }

    const paymentData = await paymentResponse.json();

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: paymentData.paymentUrl,
      proratedAmount,
      upgradeMessage,
      newPlan,
      billingPeriod
    });

  } catch (error) {
    console.error('Subscription upgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}