import { NextResponse } from 'next/server';
import { createCoupon } from '@/lib/coupon-service';
import { PackageType } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Creating test coupon...');
    
    const testCoupon = {
      code: 'TEST10',
      package_type: 'core' as PackageType,
      discount_type: 'percentage' as const,
      discount_value: 10,
      max_uses: 100,
      valid_until: null,
      is_active: true
    };
    
    const coupon = await createCoupon(testCoupon);
    
    if (coupon) {
      console.log('Test coupon created successfully:', coupon);
      return NextResponse.json({
        success: true,
        message: 'Test coupon created successfully',
        coupon
      });
    } else {
      console.error('Failed to create test coupon');
      return NextResponse.json({
        success: false,
        message: 'Failed to create test coupon'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test coupon creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test coupon creation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}