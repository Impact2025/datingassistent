/**
 * Add 2FA columns to users table
 * Run with: node scripts/add-2fa-columns.js
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function add2FAColumns() {
  try {
    console.log('🔐 Adding 2FA columns to users table...');

    // Add 2FA columns
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS two_factor_verified_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS two_factor_last_verified TIMESTAMP WITH TIME ZONE
    `;

    console.log('✅ 2FA columns added successfully');

    // Create index for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled
      ON users(two_factor_enabled)
      WHERE two_factor_enabled = true
    `;

    console.log('✅ 2FA index created successfully');
    console.log('🎉 2FA database setup complete!');

  } catch (error) {
    console.error('❌ Error adding 2FA columns:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

add2FAColumns();