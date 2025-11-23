require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function addVriendschapCoupon() {
  try {
    console.log('🏷️ Adding "Vriendschap" coupon to database...');

    // Check if coupon already exists
    const existing = await sql`
      SELECT id FROM coupons WHERE code = 'Vriendschap'
    `;

    if (existing.rows.length > 0) {
      console.log('⚠️ Coupon "Vriendschap" already exists');
      return;
    }

    // Create the Vriendschap coupon - gives 100% discount (free Pro access)
    await sql`
      INSERT INTO coupons (
        code,
        discount_type,
        discount_value,
        valid_from,
        valid_until,
        is_active,
        max_uses,
        used_count,
        description
      ) VALUES (
        'Vriendschap',
        'percentage',
        100,
        NOW(),
        NOW() + INTERVAL '1 year',
        true,
        NULL, -- unlimited uses
        0,
        'Vriendschap coupon - geeft gratis Pro toegang'
      )
    `;

    console.log('✅ "Vriendschap" coupon toegevoegd aan database');
    console.log('   - Code: Vriendschap');
    console.log('   - Type: 100% korting (gratis Pro)');
    console.log('   - Geldig: 1 jaar');
    console.log('   - Onbeperkt gebruik');

  } catch (error) {
    console.error('❌ Error adding coupon:', error);
  } finally {
    process.exit(0);
  }
}

addVriendschapCoupon();