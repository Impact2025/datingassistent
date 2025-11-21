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
      SELECT id, title, is_published, access_tier
      FROM courses
      ORDER BY id ASC
    `);

    courses.rows.forEach(c => {
      console.log(`  ${c.id}. ${c.title}`);
      console.log(`     Published: ${c.is_published}, Access: ${c.access_tier || 'N/A'}`);
    });

    console.log('\n🔒 Vergrendelen van alle cursussen behalve Red Flags...');

    // Update all courses to premium access tier except Red Flags
    const result = await client.query(`
      UPDATE courses
      SET access_tier = 'premium'
      WHERE LOWER(title) NOT LIKE '%red flag%'
        AND is_published = true
      RETURNING id, title, access_tier
    `);

    console.log(`\n✅ ${result.rows.length} cursussen vergrendeld (premium tier):`);
    result.rows.forEach(c => {
      console.log(`  - ${c.title}`);
    });

    // Ensure Red Flags course is free
    const redFlagsResult = await client.query(`
      UPDATE courses
      SET access_tier = 'free'
      WHERE LOWER(title) LIKE '%red flag%'
        AND is_published = true
      RETURNING id, title, access_tier
    `);

    if (redFlagsResult.rows.length > 0) {
      console.log(`\n🔓 Red Flags cursus blijft gratis:`);
      redFlagsResult.rows.forEach(c => {
        console.log(`  - ${c.title}`);
      });
    }

    console.log('\n✨ Klaar! Alle cursussen zijn vergrendeld behalve Red Flags.');

  } finally {
    client.release();
    await pool.end();
  }
}

lockCourses().catch(console.error);
