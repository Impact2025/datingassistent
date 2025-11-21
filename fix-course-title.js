require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function fixCourseTitle() {
  const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('No database URL found in environment variables');
    return;
  }

  const sql = neon(dbUrl);

  try {
    console.log('Updating course title...');
    await sql`
      UPDATE courses
      SET title = 'Je profieltekst die wel werkt'
      WHERE id = 32
    `;

    console.log('Course title updated successfully!');

    // Verify the change
    const result = await sql`
      SELECT id, title FROM courses WHERE id = 32
    `;
    console.log('Updated course:', result[0]);

  } catch (error) {
    console.error('Error updating course title:', error);
  }
}

fixCourseTitle().catch(console.error);