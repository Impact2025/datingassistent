import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Starting streak system migration...');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create-streak-system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Streak system tables created successfully!');
    console.log('   - user_streaks');
    console.log('   - notification_preferences');
    console.log('   - update_user_streak() function');

    // Verify tables
    const tablesCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('user_streaks', 'notification_preferences')
      ORDER BY table_name;
    `);

    console.log('\n📊 Verification:');
    tablesCheck.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Count existing users who got default preferences
    const prefsCount = await pool.query('SELECT COUNT(*) FROM notification_preferences');
    console.log(`\n👥 Created notification preferences for ${prefsCount.rows[0].count} users`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
