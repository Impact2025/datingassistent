import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function updateExistingOrder() {
  try {
    console.log('📝 Updating existing order with customer email...');

    // Update the order from the screenshot with the email
    const email = 'hello@teambuildingmetimpact.nl';

    // Find the most recent unpaid order
    const result = await sql`
      SELECT id, status, customer_email
      FROM orders
      WHERE status IN ('initialized', 'pending')
        AND customer_email IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const order = result.rows[0];
      console.log(`Found order: ${order.id} with status: ${order.status}`);

      // Update the order
      await sql`
        UPDATE orders
        SET customer_email = ${email},
            updated_at = NOW()
        WHERE id = ${order.id}
      `;

      console.log(`✅ Updated order ${order.id} with email: ${email}`);

      // Verify
      const verifyResult = await sql`
        SELECT id, customer_email, status
        FROM orders
        WHERE id = ${order.id}
      `;
      console.log('\nVerification:');
      console.log(verifyResult.rows[0]);
    } else {
      console.log('No unpaid orders found without customer email');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

updateExistingOrder()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
