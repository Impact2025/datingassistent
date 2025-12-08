const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkNewUsers() {
  try {
    // Eerst kijken welke kolommen er zijn in de users tabel
    const schemaResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('=== USERS TABEL SCHEMA ===\n');
    schemaResult.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });
    console.log('\n');

    // Gebruikers van de afgelopen 2 dagen
    const result = await pool.query(`
      SELECT *
      FROM users
      WHERE created_at >= NOW() - INTERVAL '2 days'
      ORDER BY created_at DESC
    `);

    console.log('=== NIEUWE GEBRUIKERS (laatste 2 dagen) ===\n');

    if (result.rows.length === 0) {
      console.log('Geen nieuwe gebruikers gevonden in de afgelopen 2 dagen.');
    } else {
      for (const user of result.rows) {
        console.log(JSON.stringify(user, null, 2));
        console.log('---\n');
      }
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkNewUsers();
