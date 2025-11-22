/**
 * DATABASE MIGRATIONS SERVICE
 * Professional database migration management
 * Ensures all tables, indexes, and constraints exist
 * Created: 2025-11-22
 */

import { sql } from '@vercel/postgres';
import { logDatabaseError } from '../error-logging';

export interface MigrationResult {
  success: boolean;
  migrationsRun: string[];
  errors: string[];
  duration: number;
}

/**
 * Run all pending database migrations
 */
export async function runMigrations(): Promise<MigrationResult> {
  const startTime = Date.now();
  const migrationsRun: string[] = [];
  const errors: string[] = [];

  console.log('🔄 Starting database migrations...');

  try {
    // Create migrations tracking table
    await createMigrationsTable();

    // Run migrations in order
    const migrations = [
      { name: '001_create_admin_audit_logs', fn: migration_001_admin_audit_logs },
      { name: '002_create_performance_indexes', fn: migration_002_performance_indexes },
      { name: '003_add_missing_constraints', fn: migration_003_missing_constraints },
    ];

    for (const migration of migrations) {
      try {
        const alreadyRun = await checkMigrationRun(migration.name);

        if (!alreadyRun) {
          console.log(`  Running migration: ${migration.name}`);
          await migration.fn();
          await recordMigration(migration.name);
          migrationsRun.push(migration.name);
          console.log(`  ✅ ${migration.name} completed`);
        } else {
          console.log(`  ⏭️  ${migration.name} already run`);
        }
      } catch (error) {
        const errorMsg = `Migration ${migration.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`  ❌ ${errorMsg}`);
        errors.push(errorMsg);
        logDatabaseError(error as Error, `Migration: ${migration.name}`);
        // Continue with other migrations
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Migrations completed in ${duration}ms`);

    return {
      success: errors.length === 0,
      migrationsRun,
      errors,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Migration system failed:', error);
    logDatabaseError(error as Error, 'Migration system');

    return {
      success: false,
      migrationsRun,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      duration,
    };
  }
}

// ============================================================================
// MIGRATION TRACKING
// ============================================================================

/**
 * Create migrations tracking table
 */
async function createMigrationsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

/**
 * Check if migration has been run
 */
async function checkMigrationRun(name: string): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM schema_migrations
    WHERE name = ${name}
  `;

  return result.rows[0].count > 0;
}

/**
 * Record that migration has been run
 */
async function recordMigration(name: string): Promise<void> {
  await sql`
    INSERT INTO schema_migrations (name)
    VALUES (${name})
    ON CONFLICT (name) DO NOTHING
  `;
}

// ============================================================================
// MIGRATIONS
// ============================================================================

/**
 * Migration 001: Create admin audit logs table with proper indexes
 */
async function migration_001_admin_audit_logs(): Promise<void> {
  // Create table
  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(200) NOT NULL,
      success BOOLEAN NOT NULL DEFAULT false,
      ip_address INET,
      user_agent TEXT,
      details JSONB,
      session_id VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create indexes (separately - PostgreSQL requirement)
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_user_id ON admin_audit_logs (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_logs (action)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_resource ON admin_audit_logs (resource)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_logs (created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_success ON admin_audit_logs (success)`;

  // Composite index for common queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_admin_audit_user_created
    ON admin_audit_logs (user_id, created_at DESC)
  `;

  // Create retention policy function
  await sql`
    CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
    RETURNS void AS $$
    BEGIN
      DELETE FROM admin_audit_logs
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';
    END;
    $$ LANGUAGE plpgsql;
  `;
}

/**
 * Migration 002: Add performance indexes to existing tables
 */
async function migration_002_performance_indexes(): Promise<void> {
  // Users table indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)` .catch(() => {}); // Ignore if column doesn't exist

  // Courses table indexes (if exists)
  await sql`CREATE INDEX IF NOT EXISTS idx_courses_published ON courses (published)`.catch(() => {});
  await sql`CREATE INDEX IF NOT EXISTS idx_courses_category ON courses (category)`.catch(() => {});

  // User progress indexes (if exists)
  await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id)`.catch(() => {});
  await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress (course_id)`.catch(() => {});
  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_progress_user_course
    ON user_progress (user_id, course_id)
  `.catch(() => {});

  // Forum posts indexes (if exists)
  await sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts (user_id)`.catch(() => {});
  await sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts (created_at)`.catch(() => {});
}

/**
 * Migration 003: Add missing constraints and foreign keys
 */
async function migration_003_missing_constraints(): Promise<void> {
  // Add NOT NULL constraints where needed (safely)

  // Ensure admin_audit_logs has proper constraints
  await sql`
    DO $$
    BEGIN
      -- Add foreign key to users table if it exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE admin_audit_logs
        ADD CONSTRAINT fk_admin_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE;
      END IF;
    EXCEPTION
      WHEN duplicate_object THEN NULL; -- Ignore if constraint already exists
      WHEN others THEN NULL; -- Ignore other errors (table might not exist yet)
    END $$;
  `;

  // Add check constraints for data validation
  await sql`
    DO $$
    BEGIN
      ALTER TABLE admin_audit_logs
      ADD CONSTRAINT chk_action_not_empty
      CHECK (LENGTH(TRIM(action)) > 0);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN others THEN NULL;
    END $$;
  `;

  await sql`
    DO $$
    BEGIN
      ALTER TABLE admin_audit_logs
      ADD CONSTRAINT chk_resource_not_empty
      CHECK (LENGTH(TRIM(resource)) > 0);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN others THEN NULL;
    END $$;
  `;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as connected`;
    return result.rows[0].connected === 1;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<any> {
  try {
    const tableStats = await sql`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `;

    const indexStats = await sql`
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE idx_scan > 0
      ORDER BY idx_scan DESC
      LIMIT 10
    `;

    return {
      tables: tableStats.rows,
      indexes: indexStats.rows,
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
}

/**
 * Validate database schema
 */
export async function validateDatabaseSchema(): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  try {
    // Check if critical tables exist
    const criticalTables = ['users', 'admin_audit_logs'];

    for (const table of criticalTables) {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_name = ${table}
      `;

      if (result.rows[0].count === 0) {
        issues.push(`Missing critical table: ${table}`);
      }
    }

    // Check if indexes exist
    const criticalIndexes = [
      { table: 'admin_audit_logs', index: 'idx_admin_audit_user_id' },
      { table: 'admin_audit_logs', index: 'idx_admin_audit_created_at' },
    ];

    for (const { table, index } of criticalIndexes) {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE tablename = ${table}
        AND indexname = ${index}
      `;

      if (result.rows[0].count === 0) {
        issues.push(`Missing index: ${index} on table ${table}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  } catch (error) {
    issues.push(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      valid: false,
      issues,
    };
  }
}
