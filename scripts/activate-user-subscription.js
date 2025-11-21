/**
 * Activate subscription for a user
 * Usage: node scripts/activate-user-subscription.js <userId> <packageType> <orderId>
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function activateSubscription() {
  try {
    const args = process.argv.slice(2);

    if (args.length < 2) {
      console.log('❌ Usage: node activate-user-subscription.js <userId> <packageType> [orderId]');
      console.log('   packageType: sociaal | core | pro | premium');
      console.log('   Example: node activate-user-subscription.js 67 pro ORDER-123');
      process.exit(1);
    }

    const userId = parseInt(args[0]);
    const packageType = args[1];
    const orderId = args[2] || `MANUAL-${Date.now()}`;

    console.log(`\n🔧 Activating subscription for user ${userId}...\n`);

    // Validate package type
    const validTypes = ['sociaal', 'core', 'pro', 'premium'];
    if (!validTypes.includes(packageType)) {
      console.log(`❌ Invalid package type: ${packageType}`);
      console.log(`   Valid types: ${validTypes.join(', ')}`);
      process.exit(1);
    }

    // Get user
    const userResult = await sql`
      SELECT id, email, name FROM users WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      console.log(`❌ User ${userId} not found`);
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`👤 User: ${user.name} (${user.email})`);

    // Create subscription object
    const subscription = {
      packageType: packageType,
      billingPeriod: 'yearly',
      status: 'active',
      orderId: orderId,
      startDate: new Date().toISOString(),
      amount: packageType === 'premium' ? 69.50 : packageType === 'pro' ? 39.50 : packageType === 'core' ? 24.50 : 14.50
    };

    // Update user subscription
    await sql`
      UPDATE users
      SET
        subscription = ${JSON.stringify(subscription)}::jsonb,
        subscription_type = ${packageType},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    console.log(`✅ Subscription activated!`);
    console.log(`   Package: ${packageType}`);
    console.log(`   Status: active`);
    console.log(`   Order ID: ${orderId}\n`);

    // Verify
    const verifyResult = await sql`
      SELECT subscription, subscription_type FROM users WHERE id = ${userId}
    `;

    console.log('📊 Verification:');
    console.log('   subscription_type:', verifyResult.rows[0].subscription_type);
    console.log('   subscription data:', verifyResult.rows[0].subscription);

    console.log('\n✨ Done!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

activateSubscription();
