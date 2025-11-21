require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function runCourseMigration() {
  try {
    console.log('🚀 Starting course system database migration...\n');

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'migrate-course-schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('📊 Executing migration...\n');

    // Split the SQL into individual statements (basic approach)
    // Note: This is a simple splitter - in production you'd want more robust SQL parsing
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await sql.query(statement);
        } catch (error) {
          // Log error but continue with other statements
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...\n');
        }
      }
    }

    console.log('\n✅ Course system database migration completed!');
    console.log('🎉 All course-related tables should now be available.');

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'course_%'
      ORDER BY table_name
    `;

    console.log('Created tables:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runCourseMigration();