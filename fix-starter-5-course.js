require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function fixCourse() {
  const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  const sql = neon(dbUrl);

  console.log('=== Huidige status ===');
  const before = await sql`
    SELECT id, title, is_published, duration_hours, created_at
    FROM courses
    WHERE id IN (21, 32)
    ORDER BY id
  `;
  console.table(before);

  console.log('\n=== Unpublishing cursus 21 (oude versie) ===');
  await sql`
    UPDATE courses
    SET is_published = false
    WHERE id = 21
  `;

  console.log('\n=== Nieuwe status ===');
  const after = await sql`
    SELECT id, title, is_published, duration_hours, created_at
    FROM courses
    WHERE id IN (21, 32)
    ORDER BY id
  `;
  console.table(after);

  console.log('\n✅ Klaar! Nu zou /dashboard/starter/starter-5 cursus 32 moeten vinden (de goede versie).');
}

fixCourse().catch(console.error);
