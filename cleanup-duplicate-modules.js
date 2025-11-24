require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function cleanupDuplicateModules() {
  try {
    console.log('🧹 Starting database cleanup for duplicate modules...\n');

    // First, get the course ID for the confidence course
    const courseResult = await sql`
      SELECT id FROM courses WHERE title LIKE '%zelfvertrouwen%' LIMIT 1
    `;

    if (courseResult.rows.length === 0) {
      console.log('❌ Course not found');
      return;
    }

    const courseId = courseResult.rows[0].id;
    console.log(`📚 Found course ID: ${courseId}\n`);

    // Get all modules for this course
    const modulesResult = await sql`
      SELECT id, title, position, created_at
      FROM course_modules
      WHERE course_id = ${courseId}
      ORDER BY position ASC, created_at ASC
    `;

    console.log(`📊 Found ${modulesResult.rows.length} modules total\n`);

    // Group modules by title to identify duplicates
    const modulesByTitle = {};
    modulesResult.rows.forEach(module => {
      if (!modulesByTitle[module.title]) {
        modulesByTitle[module.title] = [];
      }
      modulesByTitle[module.title].push(module);
    });

    // Process each group of modules
    for (const [title, modules] of Object.entries(modulesByTitle)) {
      if (modules.length > 1) {
        console.log(`🔄 Processing duplicates for: "${title}"`);
        console.log(`   Found ${modules.length} duplicates`);

        // Keep the first one (oldest), delete the rest
        const [keepModule, ...duplicateModules] = modules;

        console.log(`   ✅ Keeping module ID: ${keepModule.id} (created: ${keepModule.created_at})`);

        // Move all lessons from duplicate modules to the kept module
        for (const duplicate of duplicateModules) {
          console.log(`   🔄 Moving lessons from module ${duplicate.id} to ${keepModule.id}`);

          // Update lessons to point to the kept module
          await sql`
            UPDATE course_lessons
            SET module_id = ${keepModule.id}
            WHERE module_id = ${duplicate.id}
          `;

          // Delete the duplicate module
          await sql`
            DELETE FROM course_modules WHERE id = ${duplicate.id}
          `;

          console.log(`   🗑️  Deleted duplicate module ID: ${duplicate.id}`);
        }

        console.log(`   ✅ Consolidated "${title}"\n`);
      }
    }

    // Verify the cleanup
    const finalModulesResult = await sql`
      SELECT id, title, position
      FROM course_modules
      WHERE course_id = ${courseId}
      ORDER BY position ASC
    `;

    console.log('🎯 Final module structure:');
    finalModulesResult.rows.forEach(module => {
      console.log(`   ${module.position}. ${module.title} (ID: ${module.id})`);
    });

    // Count lessons per module
    console.log('\n📈 Lessons per module:');
    for (const module of finalModulesResult.rows) {
      const lessonCount = await sql`
        SELECT COUNT(*) as count FROM course_lessons WHERE module_id = ${module.id}
      `;
      console.log(`   ${module.title}: ${lessonCount.rows[0].count} lessons`);
    }

    console.log('\n🎉 Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupDuplicateModules();