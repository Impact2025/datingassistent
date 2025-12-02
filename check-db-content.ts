import { sql } from '@vercel/postgres';

async function check() {
  try {
    const result = await sql`
      SELECT
        dag_nummer,
        titel,
        video_script IS NOT NULL as has_video,
        quiz IS NOT NULL as has_quiz,
        reflectie IS NOT NULL as has_reflectie,
        werkboek IS NOT NULL as has_werkboek
      FROM program_days
      WHERE program_id = 1
      ORDER BY dag_nummer
    `;

    console.log('Database content check:');
    console.log('========================');
    for (const row of result.rows) {
      console.log(`Dag ${row.dag_nummer}: ${row.titel}`);
      console.log(`  - video_script: ${row.has_video}`);
      console.log(`  - quiz: ${row.has_quiz}`);
      console.log(`  - reflectie: ${row.has_reflectie}`);
      console.log(`  - werkboek: ${row.has_werkboek}`);
    }
    console.log('========================');
    console.log(`Total days: ${result.rows.length}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
