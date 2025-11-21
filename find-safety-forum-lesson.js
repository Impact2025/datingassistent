require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function findLesson() {
  try {
    console.log('🔍 Finding Module 1, Les 4 (Forum Discussie: Wat betekent veiligheid voor jou?)...\n');

    // Get Module 1 (ID 187)
    const lessons = await sql`
      SELECT *
      FROM course_lessons
      WHERE module_id = 187
      ORDER BY id
    `;

    console.log('📋 Module 1 lessons:');
    lessons.rows.forEach(lesson => {
      console.log(`  - ID ${lesson.id}: ${lesson.title} (${lesson.lesson_type})`);
    });

    // Find the forum discussion lesson
    const forumLesson = lessons.rows.find(l =>
      l.title.toLowerCase().includes('forum discussie') &&
      l.title.toLowerCase().includes('veiligheid')
    );

    if (forumLesson) {
      console.log(`\n✅ Found lesson: ID ${forumLesson.id}`);
      console.log(`   Title: ${forumLesson.title}`);
      console.log(`   Type: ${forumLesson.lesson_type}`);
    } else {
      console.log('\n⚠️ Forum discussion lesson not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findLesson();
