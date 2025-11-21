// Database migration: Add role column to users table
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...\n');

    // Step 1: Check if column already exists
    console.log('1. Checking if role column exists...');
    try {
      await sql`SELECT role FROM users LIMIT 1`;
      console.log('   ✅ Role column already exists!\n');
      console.log('   Skipping migration.');
      process.exit(0);
    } catch (error) {
      if (error.code === '42703') {
        console.log('   ℹ️  Role column does not exist. Adding it...\n');
      } else {
        throw error;
      }
    }

    // Step 2: Add role column
    console.log('2. Adding role column to users table...');
    await sql`
      ALTER TABLE users
      ADD COLUMN role VARCHAR(20) DEFAULT 'user'
    `;
    console.log('   ✅ Role column added successfully!\n');

    // Step 3: Create index for performance
    console.log('3. Creating index on role column...');
    await sql`
      CREATE INDEX idx_users_role ON users(role)
    `;
    console.log('   ✅ Index created successfully!\n');

    // Step 4: Set admin users
    console.log('4. Setting admin users...');

    // Admin emails (update these with your actual admin emails)
    const adminEmails = ['v_mun@hotmail.com', 'kak2@365ways.nl'];

    for (const email of adminEmails) {
      const result = await sql`
        UPDATE users
        SET role = 'admin'
        WHERE email = ${email}
        RETURNING email, role
      `;

      if (result.rows.length > 0) {
        console.log(`   ✅ Set ${email} as admin`);
      } else {
        console.log(`   ⚠️  User ${email} not found`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Admin users:');

    const admins = await sql`
      SELECT id, email, display_name, role
      FROM users
      WHERE role = 'admin'
    `;

    admins.rows.forEach(admin => {
      console.log(`   - ${admin.email} (ID: ${admin.id}) - ${admin.display_name}`);
    });

    console.log('\n✅ You can now login with these admin accounts!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n⚠️  You may need to manually add the role column:');
    console.error('   ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT \'user\';');
    console.error('   UPDATE users SET role = \'admin\' WHERE email = \'your@email.com\';');
    process.exit(1);
  }
}

migrateDatabase();
