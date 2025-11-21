require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkCourses() {
  const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('No database URL found in environment variables');
    return;
  }

  const sql = neon(dbUrl);

  console.log('=== Alle cursussen met "profieltekst" in de titel ===');
  const courses = await sql`
    SELECT id, title, is_published, created_at
    FROM courses
    WHERE LOWER(title) LIKE '%profieltekst%'
    ORDER BY id
  `;

  console.log(JSON.stringify(courses, null, 2));

  console.log('\n=== Cursus ID 21 ===');
  const course21 = await sql`
    SELECT * FROM courses WHERE id = 21
  `;
  console.log(JSON.stringify(course21, null, 2));

  console.log('\n=== Cursus ID 32 ===');
  const course32 = await sql`
    SELECT * FROM courses WHERE id = 32
  `;
  console.log(JSON.stringify(course32, null, 2));

  console.log('\n=== Alle cursussen met "starter" in de titel ===');
  const starters = await sql`
    SELECT id, title, is_published, description
    FROM courses
    WHERE LOWER(title) LIKE '%starter%'
    ORDER BY id
  `;
  console.log(JSON.stringify(starters, null, 2));
}

checkCourses().catch(console.error);
