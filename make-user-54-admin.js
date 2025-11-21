const { neon } = require('@neondatabase/serverless');

// Read DATABASE_URL from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Try DATABASE_URL first, then POSTGRES_URL
let dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!dbUrlMatch) {
  dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
}
if (!dbUrlMatch) {
  dbUrlMatch = envContent.match(/POSTGRES_URL="([^"]+)"/);
}
if (!dbUrlMatch) {
  dbUrlMatch = envContent.match(/POSTGRES_URL=(.+)/);
}

if (!dbUrlMatch) {
  console.error('DATABASE_URL or POSTGRES_URL not found in .env.local');
  process.exit(1);
}

const DATABASE_URL = dbUrlMatch[1].trim();

async function makeAdmin() {
  const sql = neon(DATABASE_URL);

  try {
    console.log('\n=== Checking current user 54 status ===');

    const userBefore = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE id = 54
    `;

    if (userBefore.length === 0) {
      console.log('❌ User 54 not found!');
      return;
    }

    console.log('Before:', userBefore[0]);

    console.log('\n=== Setting user 54 as admin ===');

    const result = await sql`
      UPDATE users
      SET role = 'admin'
      WHERE id = 54
      RETURNING id, name, email, role
    `;

    console.log('✅ Success! User updated:');
    console.log(result[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeAdmin();
