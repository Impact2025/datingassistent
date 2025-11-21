require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function findLast10() {
  try {
    const result = await sql`
      SELECT id, email, name, created_at, subscription_type
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('\n📋 Laatste 10 gebruikers:\n');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id} | ${user.name || 'Geen naam'} | ${user.email} | ${user.subscription_type || 'Geen pakket'} | ${new Date(user.created_at).toLocaleString()}`);
    });
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findLast10();
