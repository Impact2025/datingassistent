require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkRedFlagsCourse() {
  try {
    console.log('🔍 Checking for Red Flags course...\n');

    // Check courses
    const courses = await sql`
      SELECT id, title, is_free, is_published
      FROM courses
      WHERE title LIKE '%red flag%' OR title LIKE '%rode vlag%'
    `;

    console.log('📚 Courses found:', courses.rows.length);
    courses.rows.forEach(c => {
      console.log(`  - ID ${c.id}: ${c.title}`);
      console.log(`    Free: ${c.is_free}, Published: ${c.is_published}`);
    });

    if (courses.rows.length > 0) {
      const courseId = courses.rows[0].id;

      // Check modules
      const modules = await sql`
        SELECT id, title, position
        FROM course_modules
        WHERE course_id = ${courseId}
        ORDER BY position
      `;

      console.log(`\n📖 Modules for course ${courseId}:`, modules.rows.length);
      for (const mod of modules.rows) {
        console.log(`  - Module ${mod.position}: ${mod.title} (ID: ${mod.id})`);

        // Check lessons for this module
        const lessons = await sql`
          SELECT id, title, lesson_type, video_url, position
          FROM course_lessons
          WHERE module_id = ${mod.id}
          ORDER BY position
        `;

        console.log(`    Lessons: ${lessons.rows.length}`);
        lessons.rows.forEach(l => {
          console.log(`      - ${l.position}. ${l.title} (${l.lesson_type})`);
          if (l.video_url) console.log(`        Video: ${l.video_url}`);
        });
      }
    } else {
      console.log('\n⚠️ No Red Flags course found in database!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRedFlagsCourse();
