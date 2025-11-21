const { sql } = require('@vercel/postgres');

async function checkCourses() {
  try {
    // Get all courses
    const result = await sql`
      SELECT * FROM courses
      ORDER BY id ASC
    `;
    
    console.log('All courses:');
    console.log(result.rows);
    
    // Check for specific course
    const profileTextCourse = await sql`
      SELECT * FROM courses
      WHERE LOWER(title) LIKE LOWER('%profieltekst%')
    `;
    
    console.log('\nProfile text courses:');
    console.log(profileTextCourse.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkCourses();
