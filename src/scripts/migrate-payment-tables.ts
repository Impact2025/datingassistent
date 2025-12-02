import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function migratePaymentTables() {
  console.log('🚀 Starting payment tables migration...\n');

  try {
    // Test connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');

    // Check if payment_transactions table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'payment_transactions'
      )
    `;

    if (tableCheck.rows[0].exists) {
      console.log('ℹ️ payment_transactions table already exists');
    } else {
      console.log('📦 Creating payment_transactions table...');

      await sql`
        CREATE TABLE payment_transactions (
          id SERIAL PRIMARY KEY,
          order_id VARCHAR(255) UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          program_id INTEGER NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'EUR',
          payment_method VARCHAR(50) DEFAULT 'multisafepay',
          status VARCHAR(50) DEFAULT 'pending',
          multisafepay_transaction_id VARCHAR(255),
          multisafepay_status VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW(),
          paid_at TIMESTAMP,
          cancelled_at TIMESTAMP,
          refunded_at TIMESTAMP,
          updated_at TIMESTAMP DEFAULT NOW(),
          customer_email VARCHAR(255),
          customer_name VARCHAR(255),
          webhook_data JSONB,
          coupon_code VARCHAR(100),
          CONSTRAINT valid_amount CHECK (amount > 0)
        )
      `;
      console.log('✅ payment_transactions table created\n');
    }

    // Check if program_enrollments table exists
    const enrollmentsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'program_enrollments'
      )
    `;

    if (enrollmentsCheck.rows[0].exists) {
      console.log('ℹ️ program_enrollments table already exists');
    } else {
      console.log('📦 Creating program_enrollments table...');

      await sql`
        CREATE TABLE program_enrollments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          program_id INTEGER NOT NULL,
          order_id VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          enrolled_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP,
          expires_at TIMESTAMP,
          progress_percentage INTEGER DEFAULT 0,
          last_activity_at TIMESTAMP,
          UNIQUE(user_id, program_id, order_id)
        )
      `;
      console.log('✅ program_enrollments table created\n');
    }

    // Create indexes
    console.log('📦 Creating indexes...');

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_program_enrollments_user_id ON program_enrollments(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_program_enrollments_program_id ON program_enrollments(program_id)`;
      console.log('✅ Indexes created\n');
    } catch (e) {
      console.log('ℹ️ Some indexes may already exist\n');
    }

    console.log('\n🎉 Payment tables migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migratePaymentTables();
