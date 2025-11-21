import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function addCustomerFields() {
  try {
    console.log('📝 Adding customer fields to orders table...');

    // Add customer_email and customer_name columns
    await sql`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)
    `;

    console.log('✅ Customer fields added');

    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email)
    `;

    console.log('✅ Index created');

    // Verify
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'orders'
        AND column_name IN ('customer_email', 'customer_name')
    `;

    console.log('\n✅ Verification - New columns:');
    console.log(result.rows);

    console.log('\n✅ Done! Customer fields added successfully.');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addCustomerFields()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
