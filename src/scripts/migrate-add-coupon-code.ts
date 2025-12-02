import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateAddCouponCode() {
  console.log('🚀 Starting coupon_code column migration...\n');

  try {
    // Test connection first
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');

    // Check if payment_transactions table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'payment_transactions'
      )
    `;

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️ payment_transactions table does not exist yet.');
      console.log('ℹ️ The coupon_code column will be added when the table is created.\n');
      console.log('📋 To create the table, run the database-setup-payments.sql script first.\n');
      process.exit(0);
    }

    // Add coupon_code column to payment_transactions if not exists
    console.log('📦 Adding coupon_code column to payment_transactions...');
    try {
      await sql`
        ALTER TABLE payment_transactions
        ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100)
      `;
      console.log('✅ coupon_code column added to payment_transactions\n');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists')) {
        console.log('ℹ️ coupon_code column already exists in payment_transactions\n');
      } else {
        throw error;
      }
    }

    // Add coupon_code column to orders table if it exists
    console.log('📦 Adding coupon_code column to orders table (if exists)...');
    try {
      await sql`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100)
      `;
      console.log('✅ coupon_code column added to orders\n');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('does not exist')) {
        console.log('ℹ️ orders table does not exist, skipping\n');
      } else if (errorMessage.includes('already exists')) {
        console.log('ℹ️ coupon_code column already exists in orders\n');
      } else {
        console.log('⚠️ Could not add column to orders:', errorMessage, '\n');
      }
    }

    // Create index for faster coupon lookups
    console.log('📦 Creating index for coupon_code...');
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_payment_transactions_coupon_code
        ON payment_transactions(coupon_code)
        WHERE coupon_code IS NOT NULL
      `;
      console.log('✅ Index created\n');
    } catch (error) {
      console.log('ℹ️ Index might already exist\n');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nChanges made:');
    console.log('  - Added coupon_code column to payment_transactions');
    console.log('  - Added index for coupon_code lookups');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrateAddCouponCode();
