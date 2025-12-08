import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Starting achievement system migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create-achievements.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Run migration
    await pool.query(migrationSQL);

    console.log('✅ Achievement system tables and functions created successfully!\n');

    // Check how many users we have
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = usersResult.rows[0].count;
    console.log(`📊 Ready to track achievements for ${userCount} users\n`);

    // Show created tables
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename LIKE '%achievement%'
      ORDER BY tablename
    `);

    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });

    console.log('\n🎯 Achievement system is ready!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
