require('dotenv').config({ path: '.env' });
const { sql } = require('@vercel/postgres');

async function countUsers() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM users
    `;

    console.log('\n📊 Total users in database:', result.rows[0].count);

    const maxId = await sql`
      SELECT MAX(id) as max_id FROM users
    `;

    console.log('📈 Highest user ID:', maxId.rows[0].max_id);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

countUsers();
