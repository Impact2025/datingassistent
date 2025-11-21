import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { code, packageType, userId } = await request.json();

    if (!code || !packageType) {
      return NextResponse.json(
        { error: 'Coupon code and package type are required' },
        { status: 400 }
      );
    }

    // Find coupon in database
    const couponResult = await sql`
      SELECT
        id,
        code,
        discount_type,
        discount_value,
        valid_from,
        valid_until,
        is_active,
        max_uses,
        used_count
      FROM coupons
      WHERE
        code = ${code}
        AND is_active = true
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_until IS NULL OR valid_until >= NOW())
    `;

    if (couponResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Coupon code niet gevonden of verlopen' },
        { status: 404 }
      );
    }

    const coupon = couponResult.rows[0];

    // Check usage limits
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'Deze coupon is niet meer beschikbaar' },
        { status: 400 }
      );
    }

    // Check if user already used this coupon (if userId provided)
    if (userId) {
      const usageCheck = await sql`
        SELECT id FROM coupon_usage
        WHERE coupon_id = ${coupon.id} AND user_id = ${userId}
      `;

      if (usageCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'Je hebt deze coupon al gebruikt' },
          { status: 400 }
        );
      }
    }

    // Return coupon details
    return NextResponse.json({
      valid: true,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      message: coupon.discount_type === 'percentage'
        ? `${coupon.discount_value}% korting toegepast!`
        : `€${(coupon.discount_value / 100).toFixed(2)} korting toegepast!`
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het valideren van de coupon' },
      { status: 500 }
    );
  }
}