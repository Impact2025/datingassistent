/**
 * Add coupon_usage table to database
 * Run with: node scripts/add-coupon-usage-table.js
 */

const { sql } = require('@vercel/postgres');

async function addCouponUsageTable() {
  try {
    console.log('🔄 Adding coupon_usage table...');

    // Create coupon_usage table
    await sql`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        id SERIAL PRIMARY KEY,
        coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        order_id VARCHAR(255),
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(coupon_id, user_id)
      )
    `;

    // Add indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_user ON coupon_usage(coupon_id, user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usage(order_id)`;

    console.log('✅ coupon_usage table added successfully!');
    console.log('🎫 Coupon validation should now work properly.');

  } catch (error) {
    console.error('❌ Error adding coupon_usage table:', error);
    process.exit(1);
  }
}

// Run the script
addCouponUsageTable().then(() => {
  console.log('🎉 Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});