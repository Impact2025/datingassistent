const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function removeDuplicate() {
  const client = await pool.connect();
  try {
    console.log('Verwijderen van duplicate module 311...');
    
    // First check if module 311 has any lessons
    const lessons = await client.query('SELECT COUNT(*) FROM course_lessons WHERE module_id = 311');
    console.log(`Module 311 heeft ${lessons.rows[0].count} lessons`);
    
    if (lessons.rows[0].count === '0') {
      const result = await client.query('DELETE FROM course_modules WHERE id = 311 RETURNING id, title');
      console.log(`✅ Module verwijderd: ${result.rows[0].title}`);
    } else {
      console.log('⚠️  Module 311 heeft lessons, niet verwijderd');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

removeDuplicate().catch(console.error);
