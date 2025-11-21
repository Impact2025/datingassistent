import { NextRequest, NextResponse } from 'next/server';
import { updateCouponStatus } from '@/lib/coupon-service';
import { checkAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// PUT /api/admin/coupons/[id] - Update coupon status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const params = await context.params;
    console.log('PUT /api/admin/coupons/[id] called with id:', params.id);

    // Verify admin authentication
    const authResult = await checkAdminAuth();
    console.log('Auth result:', authResult);

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const body = await request.json();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });
    }

    console.log('Updating coupon:', { id, is_active: body.is_active });

    const success = await updateCouponStatus(id, body.is_active);

    if (!success) {
      return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }

    console.log('Coupon updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon: ' + (error as Error).message }, { status: 500 });
  }
}
