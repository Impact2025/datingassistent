// Quick script to check admin users
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkAdmins() {
  try {
    console.log('🔍 Checking for users in database...\n');

    // Check specific known emails (potential admins)
    console.log('🔍 Checking specific emails...\n');
    const knownEmails = ['v_mun@hotmail.com', 'kak2@365ways.nl', 'admin@example.com'];

    for (const email of knownEmails) {
      const userResult = await sql`
        SELECT id, email, display_name, name, created_at, last_login
        FROM users
        WHERE email = ${email}
      `;

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        console.log(`✅ Found user: ${email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.display_name || user.name || 'N/A'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Login: ${user.last_login || 'Never'}`);
        console.log('');
      } else {
        console.log(`❌ Not found: ${email}\n`);
      }
    }

    // Show all users (limit 10)
    console.log('📊 All users (max 10):\n');
    const allUsers = await sql`
      SELECT id, email, display_name, name, created_at, last_login
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `;

    allUsers.rows.forEach(user => {
      console.log(`  ${user.id}. ${user.email} - Name: ${user.display_name || user.name || 'N/A'} - Last login: ${user.last_login || 'Never'}`);
    });

    console.log('\n⚠️  NOTE: The "role" column does not exist in the users table yet.');
    console.log('   You need to add it with a database migration:');
    console.log('   ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT \'user\';');
    console.log('   Then set admin: UPDATE users SET role = \'admin\' WHERE email = \'your@email.com\';');

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdmins();
