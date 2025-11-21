require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function clearContent() {
  try {
    console.log('🧹 Clearing content for lesson ID 567 (Forum Discussie: Wat betekent veiligheid voor jou?)...\n');

    const result = await sql`
      UPDATE course_lessons
      SET content = ''
      WHERE id = 567
      RETURNING id, title, lesson_type
    `;

    if (result.rowCount > 0) {
      console.log('✅ Content cleared successfully!');
      console.log(`   Lesson ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Type: ${result.rows[0].lesson_type}`);
      console.log('\n💡 SafetyForumGenerator component will now load for this lesson');
    } else {
      console.log('⚠️ No lesson found with ID 567');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearContent();
