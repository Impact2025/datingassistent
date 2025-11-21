require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkDatabase() {
  try {
    console.log('🔍 Connecting to database...');

    // Test connection
    const testResult = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    // Find the course by title
    console.log('🔍 Zoeken naar course met titel "Je profieltekst die wél werkt"...');
    const result = await sql`SELECT id, title FROM courses WHERE title ILIKE '%profieltekst%' OR title ILIKE '%profile%'`;

    if (result.rows.length > 0) {
      const course = result.rows[0];
      console.log('✅ Course gevonden:');
      console.log('   ID:', course.id);
      console.log('   Title:', course.title);
      console.log('');
      console.log('📝 Gebruik dit ID in de SQL: COURSE_ID_HERE =', course.id);
      return course.id;
    } else {
      console.log('❌ Course niet gevonden. Controleren welke courses er zijn...');
      const allCourses = await sql`SELECT id, title FROM courses LIMIT 10`;
      console.log('Beschikbare courses:');
      allCourses.rows.forEach(course => {
        console.log(`   - ${course.id}: ${course.title}`);
      });
      return null;
    }
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

checkDatabase().then((courseId) => {
  if (courseId) {
    console.log('');
    console.log('🚀 Klaar om slides toe te voegen!');
    console.log('Run dit commando:');
    console.log(`node add-slides-to-course.js ${courseId}`);
  }
  process.exit(0);
});