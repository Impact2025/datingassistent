const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkNewUsers() {
  try {
    // Gebruikers van de afgelopen 2 dagen
    const result = await pool.query(`
      SELECT
        id,
        email,
        name,
        created_at,
        onboarding_completed,
        last_active
      FROM users
      WHERE created_at >= NOW() - INTERVAL '2 days'
      ORDER BY created_at DESC
    `);

    console.log('=== NIEUWE GEBRUIKERS (laatste 2 dagen) ===\n');

    if (result.rows.length === 0) {
      console.log('Geen nieuwe gebruikers gevonden in de afgelopen 2 dagen.');
    }

    for (const user of result.rows) {
      console.log(`User ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Naam: ${user.name || 'Niet ingevuld'}`);
      console.log(`Aangemeld: ${user.created_at}`);
      console.log(`Onboarding compleet: ${user.onboarding_completed ? 'Ja' : 'Nee'}`);
      console.log(`Laatste activiteit: ${user.last_active || 'Niet bekend'}`);
      console.log('---\n');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkNewUsers();
