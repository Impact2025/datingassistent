// Professional Admin Setup Script
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@datingassistent.nl';
const ADMIN_NAME = 'Dating Assistent Admin';

async function setupAdmin() {
  try {
    console.log('🔧 Professional Admin Setup\n');
    console.log('═══════════════════════════════════════\n');

    // Step 1: Check if admin@datingassistent.nl exists
    console.log('1️⃣  Checking if admin user exists...');
    const existingUser = await sql`
      SELECT id, email, display_name, role, created_at
      FROM users
      WHERE email = ${ADMIN_EMAIL}
    `;

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      console.log(`   ✅ User found: ${user.email} (ID: ${user.id})`);
      console.log(`   📝 Current role: ${user.role || 'user'}\n`);

      // Update role if not admin
      if (user.role !== 'admin') {
        console.log('2️⃣  Updating role to admin...');
        await sql`
          UPDATE users
          SET role = 'admin'
          WHERE id = ${user.id}
        `;
        console.log('   ✅ Role updated to admin!\n');
      } else {
        console.log('2️⃣  Role is already admin ✓\n');
      }
    } else {
      console.log('   ⚠️  Admin user does not exist yet\n');
      console.log('2️⃣  Creating admin user...');

      // Generate a secure password
      const tempPassword = 'AdminDatingSpark2024!';
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const newUser = await sql`
        INSERT INTO users (email, display_name, password_hash, role, created_at, updated_at)
        VALUES (${ADMIN_EMAIL}, ${ADMIN_NAME}, ${hashedPassword}, 'admin', NOW(), NOW())
        RETURNING id, email, display_name, role
      `;

      console.log('   ✅ Admin user created!');
      console.log(`   📧 Email: ${newUser.rows[0].email}`);
      console.log(`   🔑 Temporary password: ${tempPassword}`);
      console.log('   ⚠️  IMPORTANT: Change this password after first login!\n');
    }

    // Step 3: Ensure other admin emails also have admin role
    console.log('3️⃣  Ensuring other admin users have correct role...');
    const otherAdmins = ['info@datingassistent.nl', 'kak2@365ways.nl'];

    for (const email of otherAdmins) {
      const result = await sql`
        UPDATE users
        SET role = 'admin'
        WHERE email = ${email} AND role != 'admin'
        RETURNING email
      `;

      if (result.rows.length > 0) {
        console.log(`   ✅ Updated ${email} to admin`);
      }
    }

    // Step 4: Show all admins
    console.log('\n4️⃣  Current admin users:\n');
    const admins = await sql`
      SELECT id, email, display_name, role, created_at, last_login
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at
    `;

    console.log('   ╔════════════════════════════════════════════════════════════╗');
    admins.rows.forEach((admin, idx) => {
      console.log(`   ║ ${idx + 1}. ${admin.email.padEnd(30)} │ ID: ${String(admin.id).padEnd(6)} ║`);
      console.log(`   ║    Name: ${(admin.display_name || 'N/A').padEnd(25)} │ Login: ${admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'.padEnd(10)} ║`);
    });
    console.log('   ╚════════════════════════════════════════════════════════════╝\n');

    console.log('✅ Admin setup complete!\n');
    console.log('🔐 You can now login at: /admin/login');
    console.log('📧 Primary admin: admin@datingassistent.nl\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

setupAdmin();
