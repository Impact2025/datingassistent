require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkVriendschapCoupon() {
  try {
    console.log('🔍 Checking "Vriendschap" coupon in database...');

    const result = await sql`
      SELECT * FROM coupons WHERE code = 'Vriendschap'
    `;

    if (result.rows.length === 0) {
      console.log('❌ Coupon "Vriendschap" not found');
      return;
    }

    const coupon = result.rows[0];
    console.log('✅ Coupon found:');
    console.log('   Code:', coupon.code);
    console.log('   Discount Type:', coupon.discount_type);
    console.log('   Discount Value:', coupon.discount_value);
    console.log('   Active:', coupon.is_active);
    console.log('   Valid From:', coupon.valid_from);
    console.log('   Valid Until:', coupon.valid_until);
    console.log('   Max Uses:', coupon.max_uses);
    console.log('   Used Count:', coupon.used_count);

  } catch (error) {
    console.error('❌ Error checking coupon:', error);
  } finally {
    process.exit(0);
  }
}

checkVriendschapCoupon();