// Check content of course 18
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkCourseContent() {
  try {
    const courseId = 18;

    console.log(`📚 Checking content for course ID ${courseId}...\n`);

    // Get course info
    const course = await sql`
      SELECT * FROM courses WHERE id = ${courseId}
    `;

    if (course.rows.length === 0) {
      console.log('❌ Course not found');
      process.exit(1);
    }

    console.log('Course:', course.rows[0].title);
    console.log('Published:', course.rows[0].is_published);
    console.log();

    // Get modules
    const modules = await sql`
      SELECT * FROM course_modules
      WHERE course_id = ${courseId}
      ORDER BY position
    `;

    console.log(`Found ${modules.rows.length} modules:\n`);

    for (const module of modules.rows) {
      console.log(`📖 Module ${module.position}: ${module.title}`);
      console.log(`   Description: ${module.description || 'N/A'}`);

      // Get lessons for this module
      const lessons = await sql`
        SELECT * FROM course_lessons
        WHERE module_id = ${module.id}
        ORDER BY position
      `;

      console.log(`   Lessons: ${lessons.rows.length}`);

      for (const lesson of lessons.rows) {
        console.log(`   - ${lesson.position}. ${lesson.title}`);
        console.log(`     Type: ${lesson.lesson_type}`);
        console.log(`     Video URL: ${lesson.video_url || 'None'}`);
        console.log(`     Duration: ${lesson.video_duration || 'N/A'}`);
        console.log(`     Preview: ${lesson.is_preview ? 'Yes' : 'No'}`);
      }

      console.log();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCourseContent();
