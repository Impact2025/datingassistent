import { NextResponse } from 'next/server';
import { applyCoupon } from '@/lib/coupon-service';
import { PackageType } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

// POST /api/coupons/validate - Validate a coupon code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.code || !body.packageType || body.amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const result = await applyCoupon(
      body.code,
      body.packageType as PackageType,
      body.amount
    );
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
    }
    
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired coupon' }, { status: 400 });
    }
    
    return NextResponse.json({
      valid: true,
      discountAmount: result.discountAmount,
      newAmount: result.newAmount,
      coupon: result.coupon
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}