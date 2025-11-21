import { NextResponse } from 'next/server';
import { createCoupon, getAllCoupons } from '@/lib/coupon-service';
import { checkAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/coupons - Get all coupons
export async function GET() {
  try {
    console.log('GET /api/admin/coupons called');

    // Verify admin authentication
    const authResult = await checkAdminAuth();
    console.log('Auth result:', authResult);

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const coupons = await getAllCoupons();
    console.log('Coupons fetched:', coupons.length);
    
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(coupons) ? coupons : []);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    // Return empty array on error to prevent frontend issues
    return NextResponse.json([]);
  }
}

// POST /api/admin/coupons - Create a new coupon
export async function POST(request: Request) {
  try {
    console.log('POST /api/admin/coupons called');

    // Verify admin authentication
    const authResult = await checkAdminAuth();
    console.log('Auth result:', authResult);

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate required fields
    if (!body.code || !body.package_type || !body.discount_type || body.discount_value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate discount value
    if (body.discount_value <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }
    
    // Validate max_uses if provided
    if (body.max_uses !== undefined && body.max_uses !== null && body.max_uses <= 0) {
      return NextResponse.json({ error: 'Max uses must be greater than 0 or null' }, { status: 400 });
    }
    
    const coupon = await createCoupon({
      code: body.code,
      package_type: body.package_type,
      discount_type: body.discount_type,
      discount_value: body.discount_value,
      max_uses: body.max_uses,
      valid_until: body.valid_until,
      is_active: body.is_active !== undefined ? body.is_active : true
    });
    
    if (!coupon) {
      return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
    
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon: ' + (error as Error).message }, { status: 500 });
  }
}