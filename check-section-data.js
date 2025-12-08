import { sql } from '@vercel/postgres';

async function checkSectionData() {
  try {
    console.log('🔍 Checking cursus_secties table...\n');

    // Get a sample section
    const sections = await sql`
      SELECT
        id,
        les_id,
        sectie_type,
        titel,
        inhoud,
        volgorde
      FROM cursus_secties
      ORDER BY id ASC
      LIMIT 3
    `;

    console.log(`📊 Found ${sections.rows.length} sections\n`);

    sections.rows.forEach((section, index) => {
      console.log(`\n━━━━━━━ SECTION ${index + 1} ━━━━━━━`);
      console.log(`ID: ${section.id}`);
      console.log(`Les ID: ${section.les_id}`);
      console.log(`Type: ${section.sectie_type}`);
      console.log(`Titel: ${section.titel}`);
      console.log(`Volgorde: ${section.volgorde}`);
      console.log(`\nInhoud type: ${typeof section.inhoud}`);
      console.log(`Inhoud value: ${JSON.stringify(section.inhoud, null, 2)}`);

      // Check if it's a string that needs parsing
      if (typeof section.inhoud === 'string') {
        console.log('\n⚠️  INHOUD IS A STRING - NEEDS PARSING');
        try {
          const parsed = JSON.parse(section.inhoud);
          console.log(`Parsed inhoud: ${JSON.stringify(parsed, null, 2)}`);
        } catch (e) {
          console.log(`❌ Failed to parse: ${e.message}`);
        }
      } else if (section.inhoud === null) {
        console.log('\n❌ INHOUD IS NULL');
      } else if (typeof section.inhoud === 'object') {
        console.log('\n✅ INHOUD IS ALREADY AN OBJECT');
        console.log(`Keys: ${Object.keys(section.inhoud).join(', ')}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSectionData();
