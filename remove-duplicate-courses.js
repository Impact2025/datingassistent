// Remove duplicate courses created by sync
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

// IDs to DELETE (newer duplicates created today)
const DUPLICATE_IDS = [
  22, // Basiscursus: Dating Fundament (duplicate of 9)
  23, // Intermediate: Connectie & Diepgang (duplicate of 10)
  24, // Premium: Meesterschap in relaties (duplicate of 11)
  25, // Van match naar date (duplicate of 18, wrong type)
  26, // Herken de 5 grootste red flags (duplicate of 20)
];

async function removeDuplicates() {
  try {
    console.log('🗑️  Removing duplicate courses...\n');

    for (const courseId of DUPLICATE_IDS) {
      // Get course info first
      const course = await sql`
        SELECT id, title FROM courses WHERE id = ${courseId}
      `;

      if (course.rows.length === 0) {
        console.log(`⏭️  Course ID ${courseId} not found, skipping\n`);
        continue;
      }

      console.log(`Deleting: [ID ${courseId}] ${course.rows[0].title}`);

      // Delete related modules and lessons first
      const modules = await sql`
        SELECT id FROM course_modules WHERE course_id = ${courseId}
      `;

      for (const module of modules.rows) {
        await sql`DELETE FROM course_lessons WHERE module_id = ${module.id}`;
      }

      await sql`DELETE FROM course_modules WHERE course_id = ${courseId}`;

      // Delete the course
      await sql`DELETE FROM courses WHERE id = ${courseId}`;

      console.log(`✅ Deleted course ID ${courseId}\n`);
    }

    // Show final count
    const remaining = await sql`SELECT COUNT(*) as total FROM courses`;
    console.log(`\n📊 Remaining courses: ${remaining.rows[0].total}`);

    // Show breakdown
    const free = await sql`SELECT COUNT(*) as total FROM courses WHERE is_free = true`;
    const paid = await sql`SELECT COUNT(*) as total FROM courses WHERE is_free = false`;

    console.log(`   - Gratis: ${free.rows[0].total}`);
    console.log(`   - Betaald: ${paid.rows[0].total}`);

    console.log('\n🎉 Done! Duplicates removed successfully.');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

removeDuplicates();
