// Check specific user
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkUser() {
  try {
    const email = 'v.munster@weareimpact.nl';

    console.log(`🔍 Checking for user: ${email}\n`);

    const result = await sql`
      SELECT id, email, display_name, name, role, created_at, last_login
      FROM users
      WHERE email = ${email}
    `;

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ User found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.display_name || user.name || 'N/A'}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Last Login: ${user.last_login || 'Never'}`);
    } else {
      console.log('❌ User NOT found in database');
      console.log('   This user does not exist yet.');
      console.log('   You need to register this account first.');
    }

    console.log('\n📊 Current admin users:');
    const admins = await sql`
      SELECT id, email, display_name, name, role
      FROM users
      WHERE role = 'admin'
    `;

    if (admins.rows.length > 0) {
      admins.rows.forEach(admin => {
        console.log(`   - ${admin.email} (ID: ${admin.id})`);
      });
    } else {
      console.log('   No admin users found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUser();
