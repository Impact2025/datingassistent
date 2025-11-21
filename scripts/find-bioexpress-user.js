require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function findBioexpressUser() {
  try {
    const result = await sql`
      SELECT id, email, name, created_at, subscription_type, subscription
      FROM users
      WHERE email = 'vincent@bioexpress.nl'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    console.log('\n📋 Bioexpress user:\n');
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Subscription Type: ${user.subscription_type}`);
      console.log(`Subscription:`, user.subscription);
      console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
    } else {
      console.log('Geen gebruiker gevonden met email vincent@bioexpress.nl');
    }
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findBioexpressUser();
