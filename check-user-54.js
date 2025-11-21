require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

async function checkUser() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const user = await sql`
      SELECT id, name, email, role, "subscriptionType", "createdAt"
      FROM users
      WHERE id = 54
    `;

    console.log('\n=== User ID 54 Details ===');
    console.log(JSON.stringify(user[0], null, 2));

    // Also check admin users
    const admins = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE role = 'admin'
    `;

    console.log('\n=== All Admin Users ===');
    admins.forEach(admin => {
      console.log(`ID: ${admin.id}, Email: ${admin.email}, Name: ${admin.name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
