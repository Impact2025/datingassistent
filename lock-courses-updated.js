const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function lockCourses() {
  const client = await pool.connect();
  try {
    console.log('📚 Huidige cursussen:');
    const courses = await client.query(`
      SELECT id, title, is_published, is_free
      FROM courses
      WHERE is_published = true
      ORDER BY id ASC
    `);

    console.log('\nGepubliceerde cursussen:');
    courses.rows.forEach(c => {
      console.log(`  ${c.id}. ${c.title}`);
      console.log(`     Is Free: ${c.is_free}`);
    });

    console.log('\n🔒 Vergrendelen van alle cursussen behalve Red Flags...');

    // Lock all courses (set is_free = false) except Red Flags
    const result = await client.query(`
      UPDATE courses
      SET is_free = false
      WHERE LOWER(title) NOT LIKE '%red flag%'
        AND is_published = true
      RETURNING id, title, is_free
    `);

    console.log(`\n✅ ${result.rows.length} cursussen vergrendeld (is_free = false):`);
    result.rows.forEach(c => {
      console.log(`  - ${c.title}`);
    });

    // Ensure Red Flags course is free
    const redFlagsResult = await client.query(`
      UPDATE courses
      SET is_free = true
      WHERE LOWER(title) LIKE '%red flag%'
        AND is_published = true
      RETURNING id, title, is_free
    `);

    if (redFlagsResult.rows.length > 0) {
      console.log(`\n🔓 Red Flags cursus blijft gratis (is_free = true):`);
      redFlagsResult.rows.forEach(c => {
        console.log(`  - ${c.title}`);
      });
    }

    console.log('\n✨ Klaar! Alle cursussen zijn vergrendeld behalve Red Flags.');
    console.log('\n💡 Tip: Gebruikers zullen een upgrade prompt zien voor de vergrendelde cursussen.');

  } finally {
    client.release();
    await pool.end();
  }
}

lockCourses().catch(console.error);
