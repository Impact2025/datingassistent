const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, title, is_published FROM courses WHERE id = 32');
    console.log('Course status:', JSON.stringify(result.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
