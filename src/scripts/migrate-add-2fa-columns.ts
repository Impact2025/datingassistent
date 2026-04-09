/**
 * Migration: Add 2FA columns to users table
 * Run: npx tsx src/scripts/migrate-add-2fa-columns.ts
 */

import { neon } from '@neondatabase/serverless';
import { logger } from '@/lib/logger';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  logger.log('Adding 2FA columns to users table...');

  try {
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB
    `;

    logger.log('✅ 2FA columns added successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
