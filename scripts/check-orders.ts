import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function checkOrders() {
  try {
    console.log('📝 Checking all orders...\n');

    const result = await sql`
      SELECT id, user_id, status, customer_email, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('Recent orders:');
    result.rows.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ID: ${order.id}`);
      console.log(`   User ID: ${order.user_id || 'not linked'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Email: ${order.customer_email || 'not set'}`);
      console.log(`   Created: ${order.created_at}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

checkOrders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
