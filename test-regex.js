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
    const searchWords = slug.replace(/-/g, '.*');
    console.log('Search pattern:', searchWords);

    const result = await client.query(`
      SELECT id, title FROM courses
      WHERE title ~* $1
        AND is_published = true
      ORDER BY created_at DESC
      LIMIT 1
    `, [searchWords]);
    
    console.log('Found:', result.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

test().catch(console.error);
