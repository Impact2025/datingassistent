require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function fixTitle() {
  try {
    console.log('🔧 Fixing Red Flags course title for slug matching...\n');

    // Check current title
    const current = await sql`SELECT id, title FROM courses WHERE id = 20`;
    console.log('Current title:', current.rows[0].title);

    // Update to a title that matches the slug better
    const newTitle = 'Herken de 5 red flags';

    await sql`
      UPDATE courses
      SET title = ${newTitle}
      WHERE id = 20
    `;

    console.log('New title:', newTitle);

    // Test if API will find it now
    const test = await sql`
      SELECT id, title FROM courses
      WHERE LOWER(title) LIKE LOWER('%herken de 5 red flags%')
    `;

    console.log('\n✅ API will now find the course:', test.rows.length > 0 ? 'YES' : 'NO');

    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
}

fixTitle();
