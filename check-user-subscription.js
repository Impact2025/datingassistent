require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkUserSubscription() {
  try {
    console.log('🔍 Checking user subscription status...');

    // Find user by email
    const userResult = await sql`
      SELECT id, email, subscription_type, subscription_status
      FROM users
      WHERE email = 'hello@teambuildingmetimpact.nl'
    `;

    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = userResult.rows[0];
    console.log('👤 User:', user);

    // Check for active subscriptions
    const subscriptionResult = await sql`
      SELECT * FROM user_subscriptions
      WHERE user_id = ${user.id} AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (subscriptionResult.rows.length === 0) {
      console.log('❌ No active subscription found');
    } else {
      console.log('✅ Active subscription found:', subscriptionResult.rows[0]);
    }

    // Check recent orders
    const ordersResult = await sql`
      SELECT id, package_type, amount, status, created_at
      FROM orders
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    console.log('📦 Recent orders:');
    ordersResult.rows.forEach(order => {
      console.log('   -', order.id, order.package_type, '€' + (order.amount/100).toFixed(2), order.status, order.created_at);
    });

  } catch (error) {
    console.error('❌ Error checking subscription:', error);
  } finally {
    process.exit(0);
  }
}

checkUserSubscription();