require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkTitle() {
  try {
    const result = await sql`SELECT id, title FROM courses WHERE id = 20`;
    console.log('Course title:', result.rows[0].title);

    // Test the slug match
    const slug = 'herken-de-5-red-flags';
    const searchPattern = '%' + slug.replace(/-/g, ' ') + '%';
    console.log('Search pattern:', searchPattern);

    const test = await sql`
      SELECT id, title FROM courses
      WHERE LOWER(title) LIKE LOWER(${searchPattern})
    `;
    console.log('Found with LIKE:', test.rows.length > 0 ? 'YES' : 'NO');

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkTitle();
