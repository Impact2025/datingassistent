require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkTables() {
  try {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND (table_name LIKE '%goal%' OR table_name LIKE '%reflection%' OR table_name LIKE '%review%')
      ORDER BY table_name
    `;

    console.log('Goals-related tables:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Also check if user_goals table exists and has any data
    try {
      const goalsCheck = await sql`SELECT COUNT(*) as count FROM user_goals`;
      console.log(`\nuser_goals table has ${goalsCheck.rows[0].count} records`);
    } catch (error) {
      console.log('\nuser_goals table does not exist or is empty');
    }

  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();