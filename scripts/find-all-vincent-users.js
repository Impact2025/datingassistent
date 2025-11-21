require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function findVincentUsers() {
  try {
    const result = await sql`
      SELECT id, email, name, created_at, subscription_type
      FROM users
      WHERE email = 'vincent@stichtingphilia.nl'
      ORDER BY created_at DESC
    `;

    console.log('\n📋 Alle gebruikers met email vincent@stichtingphilia.nl:\n');
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

findVincentUsers();
