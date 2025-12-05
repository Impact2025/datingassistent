/**
 * Database Migration: 2FA Fields for Admin Security
 *
 * Run with: npx tsx src/scripts/migrate-2fa-fields.ts
 *
 * Adds:
 * - two_factor_secret: TOTP secret key
 * - two_factor_enabled: Boolean flag
 * - two_factor_verified_at: When 2FA was first verified
 * - two_factor_last_verified: Last successful 2FA verification
 * - backup_codes: JSON array of hashed backup codes
 * - backup_codes_generated_at: When backup codes were generated
 */

import { sql } from '@vercel/postgres';

async function migrate2FAFields() {
  console.log('🔐 Starting 2FA fields migration...\n');

  try {
    // Check if columns exist
    const columnsCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN (
        'two_factor_secret',
        'two_factor_enabled',
        'two_factor_verified_at',
        'two_factor_last_verified',
        'backup_codes',
        'backup_codes_generated_at'
      )
    `;

    const existingColumns = columnsCheck.rows.map(r => r.column_name);
    console.log('Existing 2FA columns:', existingColumns.length > 0 ? existingColumns : 'None');

    // Add two_factor_secret if not exists
    if (!existingColumns.includes('two_factor_secret')) {
      await sql`ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(64)`;
      console.log('✅ Added: two_factor_secret');
    } else {
      console.log('⏭️  Skipped: two_factor_secret (exists)');
    }

    // Add two_factor_enabled if not exists
    if (!existingColumns.includes('two_factor_enabled')) {
      await sql`ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false`;
      console.log('✅ Added: two_factor_enabled');
    } else {
      console.log('⏭️  Skipped: two_factor_enabled (exists)');
    }

    // Add two_factor_verified_at if not exists
    if (!existingColumns.includes('two_factor_verified_at')) {
      await sql`ALTER TABLE users ADD COLUMN two_factor_verified_at TIMESTAMP WITH TIME ZONE`;
      console.log('✅ Added: two_factor_verified_at');
    } else {
      console.log('⏭️  Skipped: two_factor_verified_at (exists)');
    }

    // Add two_factor_last_verified if not exists
    if (!existingColumns.includes('two_factor_last_verified')) {
      await sql`ALTER TABLE users ADD COLUMN two_factor_last_verified TIMESTAMP WITH TIME ZONE`;
      console.log('✅ Added: two_factor_last_verified');
    } else {
      console.log('⏭️  Skipped: two_factor_last_verified (exists)');
    }

    // Add backup_codes if not exists (JSONB for array storage)
    if (!existingColumns.includes('backup_codes')) {
      await sql`ALTER TABLE users ADD COLUMN backup_codes JSONB DEFAULT '[]'::jsonb`;
      console.log('✅ Added: backup_codes');
    } else {
      console.log('⏭️  Skipped: backup_codes (exists)');
    }

    // Add backup_codes_generated_at if not exists
    if (!existingColumns.includes('backup_codes_generated_at')) {
      await sql`ALTER TABLE users ADD COLUMN backup_codes_generated_at TIMESTAMP WITH TIME ZONE`;
      console.log('✅ Added: backup_codes_generated_at');
    } else {
      console.log('⏭️  Skipped: backup_codes_generated_at (exists)');
    }

    // Create index for 2FA lookups
    console.log('\n📊 Creating indexes...');

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users (two_factor_enabled) WHERE two_factor_enabled = true`;
      console.log('✅ Created: idx_users_two_factor_enabled');
    } catch (e) {
      console.log('⏭️  Index already exists or skipped');
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');

    const verifyColumns = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name LIKE '%two_factor%' OR column_name LIKE '%backup_codes%'
      ORDER BY column_name
    `;

    console.log('\n2FA Columns in users table:');
    console.table(verifyColumns.rows);

    // Check admin users 2FA status
    const adminStatus = await sql`
      SELECT
        id,
        email,
        role,
        two_factor_enabled,
        two_factor_verified_at IS NOT NULL as has_verified,
        backup_codes IS NOT NULL AND jsonb_array_length(COALESCE(backup_codes, '[]'::jsonb)) > 0 as has_backup_codes
      FROM users
      WHERE role = 'admin'
      ORDER BY id
    `;

    if (adminStatus.rows.length > 0) {
      console.log('\n👤 Admin users 2FA status:');
      console.table(adminStatus.rows);
    } else {
      console.log('\n⚠️  No admin users found');
    }

    console.log('\n✅ 2FA migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Admin users will be prompted to set up 2FA on next login');
    console.log('   2. Backup codes are automatically generated during 2FA setup');
    console.log('   3. Users can regenerate backup codes from admin settings');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate2FAFields()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
