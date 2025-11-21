require('dotenv').config({ path: '.env' });
const { sql } = require('@vercel/postgres');

async function checkUser70() {
  try {
    const result = await sql`
      SELECT id, email, name, created_at, subscription_type, subscription
      FROM users
      WHERE id = 70
    `;

    console.log('\n📋 User 70 details:\n');
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Subscription Type: ${user.subscription_type}`);
      console.log(`Subscription:`, JSON.stringify(user.subscription, null, 2));
      console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
    } else {
      console.log('Gebruiker 70 niet gevonden');
    }
    console.log('\n');

    // Also check orders for this user
    const ordersResult = await sql`
      SELECT id, package_type, amount, status, created_at
      FROM orders
      WHERE user_id = 70
      ORDER BY created_at DESC
    `;

    console.log('📦 Orders for user 70:\n');
    if (ordersResult.rows.length > 0) {
      ordersResult.rows.forEach(order => {
        console.log(`Order ID: ${order.id} | Package: ${order.package_type} | Amount: €${order.amount/100} | Status: ${order.status} | Created: ${new Date(order.created_at).toLocaleString()}`);
      });
    } else {
      console.log('Geen orders gevonden voor user 70');
    }
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser70();
