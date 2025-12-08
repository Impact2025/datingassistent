/**
 * Run Scan History System Migration
 *
 * This script creates the unified scan history system tables:
 * - user_scan_history: All scan completions with full results
 * - scan_retake_status: Retake eligibility and cooldowns
 * - user_scan_progress: Overall progress tracking
 *
 * Usage: npx tsx scripts/run-scan-history-migration.ts
 */

import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  console.log('🚀 Starting Scan History System Migration...\n');

  try {
    // Read the CORE SQL migration file (simplified without complex PL/pgSQL functions)
    const migrationPath = path.join(__dirname, 'migrations', 'create-scan-history-core.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📊 Executing migration (this may take a minute)...\n');

    // Split SQL into individual statements and execute
    // Remove comments and split by semicolons
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--')) // Remove comment lines
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let executed = 0;
    for (const statement of statements) {
      if (statement.trim().length < 10) continue; // Skip tiny fragments

      try {
        // Use tagged template for each statement
        await sql.query(statement);
        executed++;

        // Show progress for major statements
        if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX') || statement.includes('INSERT INTO')) {
          const match = statement.match(/CREATE TABLE\s+(\w+)|CREATE INDEX\s+(\w+)|INSERT INTO\s+(\w+)/i);
          if (match) {
            const name = match[1] || match[2] || match[3];
            console.log(`  ✓ ${match[0].split(' ')[0]} ${name}`);
          }
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message && (
          error.message.includes('already exists') ||
          error.message.includes('duplicate')
        )) {
          console.log(`  ⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
        } else {
          console.error(`  ❌ Failed statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }

    console.log(`\n✅ Migration executed successfully! (${executed} statements)\n`);

    // Verify table creation
    console.log('🔍 Verifying table creation...');

    const tableCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('user_scan_history', 'scan_retake_status', 'user_scan_progress')
      ORDER BY table_name
    `;

    if (tableCheck.rows.length === 3) {
      console.log('✅ All tables created successfully:');
      tableCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Warning: Not all tables were created');
      console.log(`   Expected 3 tables, found ${tableCheck.rows.length}`);
    }

    // Check migration results
    console.log('\n📈 Migration Statistics:');

    const historyCount = await sql`SELECT COUNT(*) as count FROM user_scan_history`;
    console.log(`   - Scan history entries: ${historyCount.rows[0].count}`);

    const retakeCount = await sql`SELECT COUNT(*) as count FROM scan_retake_status`;
    console.log(`   - Retake status records: ${retakeCount.rows[0].count}`);

    const progressCount = await sql`SELECT COUNT(*) as count FROM user_scan_progress`;
    console.log(`   - Progress records: ${progressCount.rows[0].count}`);

    // Show scan type breakdown
    const scanBreakdown = await sql`
      SELECT scan_type, COUNT(*) as count
      FROM user_scan_history
      GROUP BY scan_type
      ORDER BY count DESC
    `;

    if (scanBreakdown.rows.length > 0) {
      console.log('\n📊 Scan Type Breakdown:');
      scanBreakdown.rows.forEach(row => {
        console.log(`   - ${row.scan_type}: ${row.count} completions`);
      });
    }

    console.log('\n✅ MIGRATION COMPLETE!\n');
    console.log('Next steps:');
    console.log('1. Update existing scan APIs to write to history tables');
    console.log('2. Integrate scan status in dashboard');
    console.log('3. Test with real user data\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run migration
runMigration().then(() => {
  console.log('🎉 Script completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
