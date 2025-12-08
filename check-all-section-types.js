import { sql } from '@vercel/postgres';

async function checkAllSectionTypes() {
  try {
    console.log('🔍 Checking all section types in cursus_secties...\n');

    const types = await sql`
      SELECT DISTINCT sectie_type, COUNT(*) as count
      FROM cursus_secties
      GROUP BY sectie_type
      ORDER BY sectie_type
    `;

    console.log(`📊 Found ${types.rows.length} unique section types:\n`);

    types.rows.forEach(type => {
      console.log(`  ${type.sectie_type}: ${type.count} sections`);
    });

    console.log('\n\n🔍 Sample sections for each type:\n');

    for (const typeRow of types.rows) {
      const samples = await sql`
        SELECT id, les_id, titel, inhoud
        FROM cursus_secties
        WHERE sectie_type = ${typeRow.sectie_type}
        LIMIT 1
      `;

      if (samples.rows.length > 0) {
        const sample = samples.rows[0];
        console.log(`\n━━━━━━━ ${typeRow.sectie_type.toUpperCase()} ━━━━━━━`);
        console.log(`ID: ${sample.id}`);
        console.log(`Titel: ${sample.titel}`);
        console.log(`Inhoud keys: ${sample.inhoud ? Object.keys(sample.inhoud).join(', ') : 'NULL'}`);
        console.log(`Inhoud sample: ${JSON.stringify(sample.inhoud, null, 2).substring(0, 200)}...`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllSectionTypes();
