/**
 * Cursus Systeem Database Migraties
 * Run dit script met: node scripts/run-cursus-migrations.js
 */

const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  console.log('🚀 Starting cursus systeem migrations...\n');

  try {
    // Lees migratie bestanden
    const migration1Path = path.join(__dirname, '../datingassistent-pro/migrations/001_cursus_systeem.sql');
    const migration2Path = path.join(__dirname, '../datingassistent-pro/migrations/002_seed_profielfoto_cursus.sql');

    console.log('📖 Reading migration files...');
    
    if (!fs.existsSync(migration1Path)) {
      throw new Error(`Migration file not found: ${migration1Path}`);
    }
    
    if (!fs.existsSync(migration2Path)) {
      throw new Error(`Migration file not found: ${migration2Path}`);
    }

    const migration1SQL = fs.readFileSync(migration1Path, 'utf8');
    const migration2SQL = fs.readFileSync(migration2Path, 'utf8');

    // Run migratie 1: Schema
    console.log('🔧 Running migration 1: Creating tables...');
    await sql.query(migration1SQL);
    console.log('✅ Migration 1 completed: All tables created\n');

    // Run migratie 2: Seed data
    console.log('🌱 Running migration 2: Seeding data...');
    await sql.query(migration2SQL);
    console.log('✅ Migration 2 completed: Seed data inserted\n');

    // Verify
    console.log('🔍 Verifying installation...');
    const result = await sql`SELECT COUNT(*) as count FROM cursussen`;
    console.log(`✅ Found ${result.rows[0].count} cursus(sen) in database\n`);

    const cursusCheck = await sql`SELECT slug, titel FROM cursussen LIMIT 1`;
    if (cursusCheck.rows.length > 0) {
      console.log('📚 Example cursus:');
      console.log(`   Slug: ${cursusCheck.rows[0].slug}`);
      console.log(`   Titel: ${cursusCheck.rows[0].titel}\n`);
    }

    console.log('🎉 All migrations completed successfully!');
    console.log('🌐 You can now visit: http://localhost:9000/cursussen\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runMigrations();
