const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, title FROM courses WHERE id = 32');
    console.log('Course:', JSON.stringify(result.rows, null, 2));

    const modules = await client.query('SELECT id, title, position FROM course_modules WHERE course_id = 32 ORDER BY position DESC LIMIT 1');
    console.log('Laatste module:', JSON.stringify(modules.rows, null, 2));

    if (modules.rows.length > 0) {
      const lessons = await client.query('SELECT id, title, lesson_type FROM course_lessons WHERE module_id = $1', [modules.rows[0].id]);
      console.log('Lessons:', JSON.stringify(lessons.rows, null, 2));
    }
  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
