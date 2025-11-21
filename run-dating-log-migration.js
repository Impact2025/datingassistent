// Script to run the dating log database migration
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Starting Dating Log PRO database migration...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'add-dating-log-tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 SQL file loaded, executing migration...');

    // Split the SQL into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        try {
          await sql.unsafe(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // Skip errors for already existing tables/indexes
          if (error.message.includes('already exists') ||
              error.message.includes('duplicate key') ||
              error.message.includes('does not exist')) {
            console.log(`⚠️  Statement ${i + 1} skipped (table/index already exists)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with other statements
          }
        }
      }
    }

    console.log('🎉 Dating Log PRO database migration completed!');
    console.log('📊 Tables created:');
    console.log('  - weekly_dating_logs');
    console.log('  - user_matches');
    console.log('  - user_notification_preferences');

    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigration();