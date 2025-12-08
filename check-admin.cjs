const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAdmin() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        email,
        name,
        role,
        created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `);

    console.log('\n=== ADMIN ACCOUNTS ===\n');

    if (result.rows.length === 0) {
      console.log('❌ Geen admin accounts gevonden!');
    } else {
      result.rows.forEach(admin => {
        console.log(`ID: ${admin.id}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Name: ${admin.name}`);
        console.log(`Created: ${admin.created_at}`);
        console.log('---\n');
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
