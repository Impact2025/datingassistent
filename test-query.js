const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  const client = await pool.connect();
  try {
    const slug = 'je-profieltekst-die-wel-werkt';
    const searchPattern = '%' + slug.replace(/-/g, ' ') + '%';
    console.log('Zoekpatroon:', searchPattern);

    const result = await client.query(`
      SELECT id, title FROM courses
      WHERE LOWER(title) LIKE LOWER($1)
        AND is_published = true
      ORDER BY created_at DESC
      LIMIT 1
    `, [searchPattern]);
    
    console.log('Gevonden courses:', JSON.stringify(result.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

test().catch(console.error);
