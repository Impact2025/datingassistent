require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkCourse() {
  try {
    const result = await sql`
      SELECT c.id, c.title, c.description,
             COUNT(DISTINCT m.id) as modules,
             COUNT(DISTINCT l.id) as lessons
      FROM courses c
      LEFT JOIN course_modules m ON c.id = m.course_id
      LEFT JOIN course_lessons l ON m.id = l.module_id
      WHERE c.title LIKE '%zelfvertrouwen%'
      GROUP BY c.id, c.title, c.description
    `;

    console.log('Course content:');
    console.log(JSON.stringify(result.rows, null, 2));

    if (result.rows.length > 0) {
      const courseId = result.rows[0].id;

      // Get modules
      const modules = await sql`
        SELECT id, title, description, position
        FROM course_modules
        WHERE course_id = ${courseId}
        ORDER BY position ASC
      `;

      console.log('\nModules:');
      console.log(JSON.stringify(modules.rows, null, 2));

      // Get lessons for each module
      for (const module of modules.rows) {
        const lessons = await sql`
          SELECT id, title, lesson_type, content, description
          FROM course_lessons
          WHERE module_id = ${module.id}
          ORDER BY position ASC
        `;

        console.log(`\nLessons for module "${module.title}":`);
        console.log(JSON.stringify(lessons.rows, null, 2));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkCourse();
