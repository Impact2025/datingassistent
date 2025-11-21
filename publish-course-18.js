// Publish course ID 18
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function publishCourse() {
  try {
    console.log('📢 Publishing course ID 18...\n');

    const result = await sql`
      UPDATE courses
      SET is_published = true
      WHERE id = 18
      RETURNING id, title, is_published
    `;

    if (result.rows.length > 0) {
      const course = result.rows[0];
      console.log('✅ Course published!');
      console.log(`   ID: ${course.id}`);
      console.log(`   Title: ${course.title}`);
      console.log(`   Published: ${course.is_published}`);
    } else {
      console.log('❌ Course not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

publishCourse();
