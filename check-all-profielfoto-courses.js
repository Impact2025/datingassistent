// Check all versions of "De perfecte profielfoto" course
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkAllVersions() {
  try {
    console.log('🔍 Searching for "perfecte profielfoto" courses...\n');

    // Search for all courses with similar title
    const courses = await sql`
      SELECT * FROM courses
      WHERE LOWER(title) LIKE '%perfecte%profielfoto%'
      OR LOWER(title) LIKE '%profielfoto%stappen%'
      ORDER BY id
    `;

    console.log(`Found ${courses.rows.length} course(s):\n`);

    for (const course of courses.rows) {
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📚 Course ID ${course.id}: ${course.title}`);
      console.log(`   Published: ${course.is_published ? '✅' : '❌'}`);
      console.log(`   Free: ${course.is_free ? 'Yes' : 'No'}`);
      console.log(`   Created: ${course.created_at}`);
      console.log();

      // Get modules
      const modules = await sql`
        SELECT * FROM course_modules
        WHERE course_id = ${course.id}
        ORDER BY position
      `;

      console.log(`   Modules: ${modules.rows.length}`);

      for (const module of modules.rows) {
        console.log(`   📖 Module ${module.position}: ${module.title}`);

        // Get lessons
        const lessons = await sql`
          SELECT id, title, lesson_type, video_url, position
          FROM course_lessons
          WHERE module_id = ${module.id}
          ORDER BY position
        `;

        console.log(`      Lessons: ${lessons.rows.length}`);

        for (const lesson of lessons.rows) {
          const hasVideo = lesson.video_url ? '🎥' : '📄';
          console.log(`      ${hasVideo} ${lesson.position}. [${lesson.lesson_type}] ${lesson.title}`);
          if (lesson.video_url) {
            console.log(`         Video: ${lesson.video_url}`);
          }
        }
        console.log();
      }
    }

    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllVersions();
