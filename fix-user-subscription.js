require('dotenv').config({path:'.env.local'});
const {sql} = require('@vercel/postgres');

async function fixUserSubscription() {
  try {
    const userId = 112;
    const orderId = 'DA-1763722802229-r9iav782';

    // Create subscription data
    const subscriptionData = {
      packageType: 'pro',
      billingPeriod: 'yearly',
      status: 'active',
      orderId: orderId,
      startDate: new Date().toISOString(),
      amount: 0
    };

    console.log('Updating user subscription to:', subscriptionData);

    // Update user subscription
    await sql`
      UPDATE users
      SET subscription = ${JSON.stringify(subscriptionData)}::jsonb,
          subscription_type = ${subscriptionData.packageType},
          subscription_status = ${subscriptionData.status},
          subscription_start_date = ${subscriptionData.startDate},
          updated_at = NOW()
      WHERE id = ${userId}
    `;

    console.log('✅ User subscription updated successfully');

    // Verify the update
    const result = await sql`
      SELECT id, email, subscription_type, subscription_status, subscription
      FROM users
      WHERE id = ${userId}
    `;

    console.log('Updated user data:');
    console.log(JSON.stringify(result.rows[0], null, 2));

  } catch (error) {
    console.error('Error fixing subscription:', error);
  } finally {
    process.exit(0);
  }
}

fixUserSubscription();