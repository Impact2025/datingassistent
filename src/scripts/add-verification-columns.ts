import { sql } from '@vercel/postgres';

async function addVerificationColumns() {
  console.log('🔧 Adding email verification columns to users table...');

  try {
    // Add columns one by one
    console.log('Adding email_verified column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;`;

    console.log('Adding verification_token column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);`;

    console.log('Adding verification_expires_at column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP;`;

    // Migrate existing users to verified status
    console.log('Migrating existing users to verified status...');
    const result = await sql`
      UPDATE users
      SET email_verified = true
      WHERE email_verified IS NULL OR email_verified = false;
    `;

    console.log(`✅ Migrated ${result.rowCount} existing users to verified status`);

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_verification_expires ON users(verification_expires_at);`;

    console.log('✅ Email verification columns added successfully!');

    // Verify the changes
    const verifyResult = await sql`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
      FROM users;
    `;

    console.log(`📊 Verification stats: ${verifyResult.rows[0].verified_users}/${verifyResult.rows[0].total_users} users verified`);

  } catch (error) {
    console.error('❌ Error adding verification columns:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addVerificationColumns()
    .then(() => {
      console.log('🎉 Database update completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database update failed:', error);
      process.exit(1);
    });
}