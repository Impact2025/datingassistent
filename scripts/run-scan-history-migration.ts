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

import { db } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  console.log('🚀 Starting Scan History System Migration...\n');

  try {
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create-scan-history-system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📊 Executing migration...\n');

    // Execute the migration
    const result = await db.query(migrationSQL);

    console.log('✅ Migration executed successfully!\n');

    // Verify table creation
    console.log('🔍 Verifying table creation...');

    const tableCheck = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('user_scan_history', 'scan_retake_status', 'user_scan_progress')
      ORDER BY table_name;
    `);

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

    const historyCount = await db.query('SELECT COUNT(*) as count FROM user_scan_history');
    console.log(`   - Scan history entries: ${historyCount.rows[0].count}`);

    const retakeCount = await db.query('SELECT COUNT(*) as count FROM scan_retake_status');
    console.log(`   - Retake status records: ${retakeCount.rows[0].count}`);

    const progressCount = await db.query('SELECT COUNT(*) as count FROM user_scan_progress');
    console.log(`   - Progress records: ${progressCount.rows[0].count}`);

    // Show scan type breakdown
    const scanBreakdown = await db.query(`
      SELECT scan_type, COUNT(*) as count
      FROM user_scan_history
      GROUP BY scan_type
      ORDER BY count DESC
    `);

    console.log('\n📊 Scan Type Breakdown:');
    scanBreakdown.rows.forEach(row => {
      console.log(`   - ${row.scan_type}: ${row.count} completions`);
    });

    // Test helper functions
    console.log('\n🧪 Testing helper functions...');

    const functionCheck = await db.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name IN ('can_user_retake_scan', 'get_user_scan_summary')
      ORDER BY routine_name;
    `);

    if (functionCheck.rows.length === 2) {
      console.log('✅ Helper functions created:');
      functionCheck.rows.forEach(row => {
        console.log(`   - ${row.routine_name}()`);
      });
    }

    console.log('\n✅ MIGRATION COMPLETE!\n');
    console.log('Next steps:');
    console.log('1. Create API endpoints (/api/scans/*)');
    console.log('2. Build UI components (ScanStatusBadge, ScanResultsPreview)');
    console.log('3. Update existing scan APIs to populate history tables');
    console.log('4. Test with real user data\n');

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
