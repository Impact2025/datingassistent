/**
 * Lead Activation Flow - Database Migration
 *
 * Adds columns for:
 * - Lead intake data (segmentation questions)
 * - Freemium credits system
 * - Initial photo score from onboarding
 *
 * Run with: npx tsx src/scripts/migrate-lead-activation.ts
 */

import { sql } from '@vercel/postgres';

async function migrate() {
  console.log('Starting Lead Activation migration...\n');

  try {
    // 1. Add lead_intake column to user_profiles
    console.log('1. Adding lead_intake column to user_profiles...');
    await sql`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS lead_intake JSONB;
    `;
    console.log('   ✅ lead_intake column added\n');

    // 2. Add freemium_credits column to users
    console.log('2. Adding freemium_credits column to users...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS freemium_credits INTEGER DEFAULT 1;
    `;
    console.log('   ✅ freemium_credits column added (default: 1)\n');

    // 3. Add initial_photo_score column to users
    console.log('3. Adding initial_photo_score column to users...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS initial_photo_score DECIMAL(3,1);
    `;
    console.log('   ✅ initial_photo_score column added\n');

    // 4. Add lead_onboarding_completed column to users
    console.log('4. Adding lead_onboarding_completed column to users...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS lead_onboarding_completed BOOLEAN DEFAULT FALSE;
    `;
    console.log('   ✅ lead_onboarding_completed column added\n');

    // 5. Add lead_oto_shown column to track if OTO was shown
    console.log('5. Adding lead_oto_shown column to users...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS lead_oto_shown BOOLEAN DEFAULT FALSE;
    `;
    console.log('   ✅ lead_oto_shown column added\n');

    // 6. Create index for quick freemium user lookups
    console.log('6. Creating index for freemium users...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_freemium_credits
      ON users(freemium_credits)
      WHERE freemium_credits > 0;
    `;
    console.log('   ✅ Index created\n');

    console.log('========================================');
    console.log('✅ Lead Activation migration completed!');
    console.log('========================================\n');

    console.log('New columns added:');
    console.log('  - user_profiles.lead_intake (JSONB)');
    console.log('  - users.freemium_credits (INTEGER, default 1)');
    console.log('  - users.initial_photo_score (DECIMAL)');
    console.log('  - users.lead_onboarding_completed (BOOLEAN)');
    console.log('  - users.lead_oto_shown (BOOLEAN)\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
