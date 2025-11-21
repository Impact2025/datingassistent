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

    // Test zonder case sensitivity
    const result = await client.query(`
      SELECT id, title FROM courses
      WHERE title ILIKE $1
        AND is_published = true
      ORDER BY created_at DESC
      LIMIT 1
    `, [searchPattern]);
    
    console.log('Gevonden courses met ILIKE:', JSON.stringify(result.rows, null, 2));

    // Test met unaccent extension
    const result2 = await client.query(`
      SELECT id, title FROM courses
      WHERE title ~* $1
        AND is_published = true
      ORDER BY created_at DESC
      LIMIT 1
    `, ['je.*profieltekst']);
    
    console.log('Gevonden courses met regex:', JSON.stringify(result2.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

test().catch(console.error);
