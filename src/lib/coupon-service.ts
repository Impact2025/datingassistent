import { sql } from '@vercel/postgres';
import { PackageType } from './subscription';

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  package_type: PackageType;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: Date;
  valid_until: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new coupon
 */
export async function createCoupon(couponData: {
  code: string;
  package_type: PackageType;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  valid_until: string | null;
  is_active: boolean;
}): Promise<Coupon | null> {
  try {
    // Validate inputs
    if (!couponData.code || !couponData.package_type || !couponData.discount_type) {
      throw new Error('Missing required fields');
    }
    
    if (couponData.discount_value <= 0) {
      throw new Error('Discount value must be greater than 0');
    }
    
    const result = await sql`
      INSERT INTO coupons (
        code, package_type, discount_type, discount_value, 
        max_uses, valid_until, is_active
      ) VALUES (
        ${couponData.code}, 
        ${couponData.package_type}, 
        ${couponData.discount_type}, 
        ${couponData.discount_value},
        ${couponData.max_uses},
        ${couponData.valid_until},
        ${couponData.is_active}
      )
      RETURNING *
    `;

    return result.rows[0] as Coupon;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error; // Re-throw to let the API handler handle it
  }
}

/**
 * Get all coupons
 */
export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const result = await sql`
      SELECT 
        id, code, package_type, discount_type, discount_value,
        max_uses, used_count, valid_from, valid_until, is_active,
        created_at, updated_at
      FROM coupons 
      ORDER BY created_at DESC
    `;
    
    // Convert date strings to Date objects
    const coupons = result.rows.map(row => ({
      ...row,
      valid_from: row.valid_from ? new Date(row.valid_from) : new Date(),
      valid_until: row.valid_until ? new Date(row.valid_until) : null,
      created_at: row.created_at ? new Date(row.created_at) : new Date(),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
    }));
    
    return Array.isArray(coupons) ? coupons as Coupon[] : [];
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
}

/**
 * Get coupon by code
 */
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const result = await sql`
      SELECT 
        id, code, package_type, discount_type, discount_value,
        max_uses, used_count, valid_from, valid_until, is_active,
        created_at, updated_at
      FROM coupons 
      WHERE code = ${code} 
      AND is_active = true
      AND valid_from <= NOW()
      AND (valid_until IS NULL OR valid_until >= NOW())
    `;
    
    if (result.rows.length === 0) return null;
    
    // Convert date strings to Date objects
    const row = result.rows[0];
    const coupon = {
      ...row,
      valid_from: row.valid_from ? new Date(row.valid_from) : new Date(),
      valid_until: row.valid_until ? new Date(row.valid_until) : null,
      created_at: row.created_at ? new Date(row.created_at) : new Date(),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
    };
    
    return coupon as Coupon;
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return null;
  }
}

/**
 * Update coupon status
 */
export async function updateCouponStatus(id: number, is_active: boolean): Promise<boolean> {
  try {
    await sql`
      UPDATE coupons 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE id = ${id}
    `;
    
    return true;
  } catch (error) {
    console.error('Error updating coupon status:', error);
    return false;
  }
}

/**
 * Apply coupon to calculate discount
 */
export async function applyCoupon(
  code: string, 
  packageType: PackageType,
  amount: number
): Promise<{ 
  valid: boolean; 
  discountAmount?: number; 
  newAmount?: number;
  coupon?: Coupon 
} | null> {
  try {
    const coupon = await getCouponByCode(code);
    
    // Check if coupon exists and is valid
    if (!coupon) {
      return { valid: false, discountAmount: 0, newAmount: amount };
    }
    
    // Check if coupon applies to this package
    if (coupon.package_type !== packageType) {
      return { valid: false, discountAmount: 0, newAmount: amount };
    }
    
    // Check usage limits
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return { valid: false, discountAmount: 0, newAmount: amount };
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round(amount * (coupon.discount_value / 100));
    } else {
      discountAmount = Math.round(Math.min(coupon.discount_value, amount));
    }
    
    const newAmount = Math.max(0, amount - discountAmount);
    
    return {
      valid: true,
      discountAmount,
      newAmount,
      coupon
    };
  } catch (error) {
    console.error('Error applying coupon:', error);
    return null;
  }
}

/**
 * Increment coupon usage count
 */
export async function incrementCouponUsage(couponId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE coupons 
      SET used_count = used_count + 1, updated_at = NOW()
      WHERE id = ${couponId}
    `;
    
    return true;
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    return false;
  }
}