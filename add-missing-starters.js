// Add missing starter courses directly to database
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

const MISSING_STARTERS = [
  {
    title: 'Boost je dating zelfvertrouwen',
    description: 'Een audio pep-talk van tien minuten om met een positieve mindset te daten.',
    slug: 'boost-je-dating-zelfvertrouwen',
    position: 3,
  },
  {
    title: 'Herken de 5 grootste "red flags"',
    description: 'Infographic en video die je leren hoe je veilig blijft en waarschuwingssignalen herkent.',
    slug: 'herken-de-5-red-flags',
    position: 4,
  },
  {
    title: 'Je profieltekst die wél werkt',
    description: 'Praktisch werkblad om een aantrekkelijke bio te schrijven die reacties uitlokt.',
    slug: 'je-profieltekst-die-wel-werkt',
    position: 5,
  },
];

async function addMissingStarters() {
  try {
    console.log('🔄 Adding missing starter courses...\n');

    for (const course of MISSING_STARTERS) {
      // Check if course already exists
      const existing = await sql`
        SELECT id, title FROM courses WHERE title = ${course.title} LIMIT 1
      `;

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipped: "${course.title}" (already exists, ID: ${existing.rows[0].id})\n`);
        continue;
      }

      // Insert course
      const result = await sql`
        INSERT INTO courses (
          title,
          description,
          level,
          is_free,
          price,
          duration_hours,
          is_published,
          position
        ) VALUES (
          ${course.title},
          ${course.description},
          'beginner',
          true,
          0,
          1,
          true,
          ${course.position}
        )
        RETURNING id, title
      `;

      console.log(`✅ Added: "${result.rows[0].title}" (ID: ${result.rows[0].id})\n`);
    }

    // Show final count
    const allCourses = await sql`
      SELECT COUNT(*) as total FROM courses WHERE is_free = true
    `;

    console.log(`\n📊 Total gratis cursussen in database: ${allCourses.rows[0].total}`);
    console.log('\n🎉 Done! All starter courses have been added.');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

addMissingStarters();
