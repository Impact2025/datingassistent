// Set v.munster@weareimpact.nl as the ONLY admin
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function setSingleAdmin() {
  try {
    console.log('🔄 Setting v.munster@weareimpact.nl as the only admin...\n');

    // Step 1: Remove admin role from all users
    console.log('1. Removing admin role from all users...');
    await sql`
      UPDATE users
      SET role = 'user'
      WHERE role = 'admin'
    `;
    console.log('   ✅ All admin roles removed\n');

    // Step 2: Set v.munster@weareimpact.nl as admin
    console.log('2. Setting v.munster@weareimpact.nl as admin...');
    const result = await sql`
      UPDATE users
      SET role = 'admin'
      WHERE email = 'v.munster@weareimpact.nl'
      RETURNING id, email, display_name, role
    `;

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('   ✅ Admin set successfully!');
      console.log(`      ID: ${admin.id}`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Name: ${admin.display_name || 'N/A'}`);
      console.log(`      Role: ${admin.role}\n`);
    } else {
      console.log('   ❌ User not found!\n');
      process.exit(1);
    }

    // Step 3: Verify
    console.log('3. Verifying admin users...');
    const admins = await sql`
      SELECT id, email, display_name, role
      FROM users
      WHERE role = 'admin'
    `;

    console.log(`   Found ${admins.rows.length} admin(s):\n`);
    admins.rows.forEach(admin => {
      console.log(`   ✅ ${admin.email} (ID: ${admin.id})`);
    });

    console.log('\n🎉 Success! v.munster@weareimpact.nl is now the only admin.');
    console.log('\n⚠️  IMPORTANT: You can login with this email address.');
    console.log('   If you forgot the password, you can:');
    console.log('   1. Use "Wachtwoord vergeten" on the login page');
    console.log('   2. Or reset it via Neon database console');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

setSingleAdmin();
