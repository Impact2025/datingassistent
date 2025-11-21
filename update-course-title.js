const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateTitle() {
  const client = await pool.connect();
  try {
    console.log('Oude titel ophalen...');
    const before = await client.query('SELECT id, title FROM courses WHERE id = 32');
    console.log('Oude titel:', before.rows[0].title);

    console.log('\nTitel updaten...');
    const result = await client.query(`
      UPDATE courses
      SET title = 'Een profieltekst die wél werkt'
      WHERE id = 32
      RETURNING id, title
    `);
    
    console.log('Nieuwe titel:', result.rows[0].title);
    console.log('\n✅ Titel succesvol geupdate!');
  } finally {
    client.release();
    await pool.end();
  }
}

updateTitle().catch(console.error);
