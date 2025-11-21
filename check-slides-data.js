const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    console.log('Course info:');
    const course = await client.query('SELECT id, title, is_published FROM courses WHERE id = 32');
    console.log(JSON.stringify(course.rows[0], null, 2));

    console.log('\nModules:');
    const modules = await client.query('SELECT id, title, position FROM course_modules WHERE course_id = 32 ORDER BY position ASC');
    modules.rows.forEach(m => console.log(`  - Module ${m.position}: ${m.title} (ID: ${m.id})`));

    console.log('\nLessons in module 312:');
    const lessons = await client.query(`
      SELECT id, title, lesson_type, position,
             CASE WHEN content IS NOT NULL THEN length(content) ELSE 0 END as content_length
      FROM course_lessons
      WHERE module_id = 312
      ORDER BY position ASC
    `);

    for (const lesson of lessons.rows) {
      console.log(`\n  Lesson ${lesson.position}: ${lesson.title}`);
      console.log(`  Type: ${lesson.lesson_type}`);
      console.log(`  Content length: ${lesson.content_length} chars`);

      if (lesson.lesson_type === 'slides') {
        const fullLesson = await client.query('SELECT content FROM course_lessons WHERE id = $1', [lesson.id]);
        if (fullLesson.rows[0] && fullLesson.rows[0].content) {
          try {
            const parsed = JSON.parse(fullLesson.rows[0].content);
            console.log(`  Slides title: ${parsed.title || 'N/A'}`);
            console.log(`  Slides count: ${parsed.slides ? parsed.slides.length : 0}`);
            if (parsed.slides && parsed.slides.length > 0) {
              console.log(`  First slide: ${parsed.slides[0].title}`);
            }
          } catch (e) {
            console.log(`  ERROR parsing JSON: ${e.message}`);
          }
        }
      }
    }

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
