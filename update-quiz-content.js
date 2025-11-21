require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function updateQuizContent() {
  try {
    console.log('🔧 Updating quiz content to trigger interactive components...\n');

    // Update pre-quiz content to empty (component will render instead)
    await sql`
      UPDATE course_lessons
      SET content = ''
      WHERE id IN (
        SELECT id FROM course_lessons
        WHERE module_id = 187
        AND lesson_type = 'quiz'
        AND title LIKE '%Pre-Quiz%'
      )
    `;

    console.log('✅ Pre-quiz content cleared (will show interactive component)');

    // Update post-quiz content to empty (component will render instead)
    await sql`
      UPDATE course_lessons
      SET content = ''
      WHERE id IN (
        SELECT id FROM course_lessons
        WHERE module_id = 188
        AND lesson_type = 'quiz'
        AND title LIKE '%Post-Quiz%'
      )
    `;

    console.log('✅ Post-quiz content cleared (will show interactive component)');

    // Verify
    const prequiz = await sql`
      SELECT id, title, LENGTH(content) as content_length
      FROM course_lessons
      WHERE module_id = 187
      AND lesson_type = 'quiz'
    `;

    const postquiz = await sql`
      SELECT id, title, LENGTH(content) as content_length
      FROM course_lessons
      WHERE module_id = 188
      AND lesson_type = 'quiz'
      AND title LIKE '%Post-Quiz%'
    `;

    console.log('\n📊 Verification:');
    console.log('Pre-quiz lessons:', prequiz.rows);
    console.log('Post-quiz lessons:', postquiz.rows);

    console.log('\n✅ Done! Refresh the page to see interactive quizzes.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
}

updateQuizContent();
