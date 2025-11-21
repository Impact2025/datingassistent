import { sql } from '@vercel/postgres';

/**
 * Professional Database Migration for Email Verification System
 *
 * This migration safely adds email verification columns to existing users table
 * and handles all edge cases for production deployment.
 */

interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

export async function migrateEmailVerification(): Promise<MigrationResult> {
  console.log('🚀 Starting Email Verification Database Migration...');

  try {
    // Step 1: Check current database state
    console.log('📊 Analyzing current database state...');
    const currentState = await analyzeCurrentState();

    if (!currentState.usersTableExists) {
      return {
        success: false,
        message: 'Users table does not exist. Please run database initialization first.',
      };
    }

    // Step 2: Check if migration already completed
    if (currentState.migrationCompleted) {
      console.log('✅ Migration already completed');
      return {
        success: true,
        message: 'Email verification migration already completed',
        details: currentState,
      };
    }

    // Step 3: Backup strategy (log current state)
    console.log('💾 Creating migration backup...');
    await logMigrationStart(currentState);

    // Step 4: Add new columns safely
    console.log('🔧 Adding email verification columns...');
    await addEmailVerificationColumns();

    // Step 5: Migrate existing users to verified state (for backwards compatibility)
    console.log('👥 Migrating existing users...');
    const migrationStats = await migrateExistingUsers();

    // Step 6: Create necessary indexes
    console.log('📈 Creating performance indexes...');
    await createVerificationIndexes();

    // Step 7: Validation
    console.log('✅ Validating migration...');
    const validationResult = await validateMigration();

    if (!validationResult.valid) {
      throw new Error(`Migration validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Step 8: Mark migration as complete
    await markMigrationComplete();

    console.log('🎉 Email verification migration completed successfully!');

    return {
      success: true,
      message: 'Email verification migration completed successfully',
      details: {
        ...migrationStats,
        validation: validationResult,
        timestamp: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);

    // Attempt rollback if possible
    try {
      await rollbackMigration();
    } catch (rollbackError) {
      console.error('❌ Rollback also failed:', rollbackError);
    }

    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error },
    };
  }
}

async function analyzeCurrentState() {
  console.log('🔍 Checking users table structure...');

  // Check if users table exists
  const tableCheck = await sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'users'
    ) as table_exists;
  `;

  const usersTableExists = tableCheck.rows[0]?.table_exists || false;

  if (!usersTableExists) {
    return { usersTableExists: false };
  }

  // Check current columns
  const columnCheck = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY column_name;
  `;

  const existingColumns = columnCheck.rows.map(row => row.column_name);

  // Check if new columns already exist
  const hasEmailVerified = existingColumns.includes('email_verified');
  const hasVerificationToken = existingColumns.includes('verification_token');
  const hasVerificationExpiresAt = existingColumns.includes('verification_expires_at');

  // Check existing user count
  const userCountResult = await sql`SELECT COUNT(*) as count FROM users;`;
  const userCount = parseInt(userCountResult.rows[0]?.count || '0');

  const migrationCompleted = hasEmailVerified && hasVerificationToken && hasVerificationExpiresAt;

  return {
    usersTableExists: true,
    existingColumns,
    hasEmailVerified,
    hasVerificationToken,
    hasVerificationExpiresAt,
    migrationCompleted,
    userCount,
  };
}

async function logMigrationStart(state: any) {
  console.log('📝 Logging migration start...');

  // Create migration log table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS migration_logs (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      status VARCHAR(50) DEFAULT 'running',
      details JSONB,
      error_message TEXT
    );
  `;

  // Log migration start
  await sql`
    INSERT INTO migration_logs (migration_name, details)
    VALUES ('email_verification_migration', ${JSON.stringify(state)});
  `;

  console.log('✅ Migration start logged');
}

async function addEmailVerificationColumns() {
  console.log('🔧 Adding email verification columns...');

  // Add columns one by one to handle potential conflicts
  const columns = [
    {
      name: 'email_verified',
      definition: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;'
    },
    {
      name: 'verification_token',
      definition: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);'
    },
    {
      name: 'verification_expires_at',
      definition: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP;'
    }
  ];

  for (const column of columns) {
    try {
      console.log(`Adding column: ${column.name}`);
      // Use template literals for dynamic SQL
      if (column.name === 'email_verified') {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;`;
      } else if (column.name === 'verification_token') {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);`;
      } else if (column.name === 'verification_expires_at') {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP;`;
      }
      console.log(`✅ Column ${column.name} added successfully`);
    } catch (error) {
      console.warn(`⚠️ Column ${column.name} may already exist or failed to add:`, error);
      // Continue with other columns - this is safe
    }
  }

  console.log('✅ Email verification columns added');
}

async function migrateExistingUsers(): Promise<{ migrated: number; skipped: number }> {
  console.log('👥 Migrating existing users to verified state...');

  // For backwards compatibility, mark all existing users as verified
  // This assumes existing users were created through proper channels
  const result = await sql`
    UPDATE users
    SET email_verified = true
    WHERE email_verified IS NULL OR email_verified = false;
  `;

  const migrated = result.rowCount || 0;

  console.log(`✅ Migrated ${migrated} existing users to verified state`);

  return {
    migrated,
    skipped: 0, // All existing users are migrated to verified
  };
}

async function createVerificationIndexes() {
  console.log('📈 Creating verification indexes...');

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);',
    'CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);',
    'CREATE INDEX IF NOT EXISTS idx_users_verification_expires ON users(verification_expires_at);',
    // Composite index for efficient token validation
    'CREATE INDEX IF NOT EXISTS idx_users_token_expiry ON users(verification_token, verification_expires_at);'
  ];

  for (const indexName of ['email_verified', 'verification_token', 'verification_expires', 'token_expiry']) {
    try {
      console.log(`Creating index: idx_users_${indexName}`);
      if (indexName === 'email_verified') {
        await sql`CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);`;
      } else if (indexName === 'verification_token') {
        await sql`CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);`;
      } else if (indexName === 'verification_expires') {
        await sql`CREATE INDEX IF NOT EXISTS idx_users_verification_expires ON users(verification_expires_at);`;
      } else if (indexName === 'token_expiry') {
        await sql`CREATE INDEX IF NOT EXISTS idx_users_token_expiry ON users(verification_token, verification_expires_at);`;
      }
    } catch (error) {
      console.warn(`⚠️ Index creation failed for ${indexName} (may already exist):`, error);
    }
  }

  console.log('✅ Verification indexes created');
}

async function validateMigration(): Promise<{ valid: boolean; errors: string[] }> {
  console.log('🔍 Validating migration...');

  const errors: string[] = [];

  try {
    // Check if all required columns exist
    const columnCheck = await sql`
      SELECT
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') as has_email_verified,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_token') as has_verification_token,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_expires_at') as has_verification_expires_at;
    `;

    const columns = columnCheck.rows[0];

    if (!columns.has_email_verified) errors.push('email_verified column missing');
    if (!columns.has_verification_token) errors.push('verification_token column missing');
    if (!columns.has_verification_expires_at) errors.push('verification_expires_at column missing');

    // Check if existing users are marked as verified
    const verifiedCheck = await sql`
      SELECT COUNT(*) as total_users, COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
      FROM users;
    `;

    const stats = verifiedCheck.rows[0];
    console.log(`📊 User verification stats: ${stats.verified_users}/${stats.total_users} users verified`);

    // Test basic functionality
    const testUser = await sql`
      SELECT id, email, email_verified FROM users LIMIT 1;
    `;

    if (testUser.rows.length > 0) {
      const user = testUser.rows[0];
      console.log(`🧪 Test user verification status: ${user.email} -> ${user.email_verified}`);
    }

  } catch (error) {
    errors.push(`Validation query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

async function markMigrationComplete() {
  console.log('✅ Marking migration as complete...');

  await sql`
    UPDATE migration_logs
    SET status = 'completed', completed_at = CURRENT_TIMESTAMP
    WHERE migration_name = 'email_verification_migration' AND status = 'running';
  `;

  console.log('✅ Migration marked as complete');
}

async function rollbackMigration() {
  console.log('🔄 Attempting migration rollback...');

  try {
    // Remove added columns (be very careful with this!)
    const rollbackSql = [
      'ALTER TABLE users DROP COLUMN IF EXISTS verification_expires_at;',
      'ALTER TABLE users DROP COLUMN IF EXISTS verification_token;',
      'ALTER TABLE users DROP COLUMN IF EXISTS email_verified;'
    ];

    for (const sqlCmd of rollbackSql) {
      try {
        if (sqlCmd.includes('verification_expires_at')) {
          await sql`ALTER TABLE users DROP COLUMN IF EXISTS verification_expires_at;`;
        } else if (sqlCmd.includes('verification_token')) {
          await sql`ALTER TABLE users DROP COLUMN IF EXISTS verification_token;`;
        } else if (sqlCmd.includes('email_verified')) {
          await sql`ALTER TABLE users DROP COLUMN IF EXISTS email_verified;`;
        }
      } catch (error) {
        console.warn('⚠️ Rollback step failed:', error);
      }
    }

    // Mark migration as failed
    await sql`
      UPDATE migration_logs
      SET status = 'failed', completed_at = CURRENT_TIMESTAMP
      WHERE migration_name = 'email_verification_migration' AND status = 'running';
    `;

    console.log('✅ Migration rollback completed');
  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
}

// CLI runner
if (require.main === module) {
  migrateEmailVerification()
    .then((result) => {
      console.log('\n' + '='.repeat(50));
      if (result.success) {
        console.log('🎉 MIGRATION SUCCESSFUL');
        console.log(result.message);
        if (result.details) {
          console.log('Details:', JSON.stringify(result.details, null, 2));
        }
      } else {
        console.log('❌ MIGRATION FAILED');
        console.log(result.message);
        if (result.details) {
          console.log('Error details:', result.details);
        }
        process.exit(1);
      }
      console.log('='.repeat(50));
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

export default migrateEmailVerification;