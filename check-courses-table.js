const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTable() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses'
      ORDER BY ordinal_position
    `);
    
    console.log('Courses table kolommen:');
    result.rows.forEach(r => {
      console.log(`  - ${r.column_name}: ${r.data_type}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

checkTable().catch(console.error);
