const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const secties = await sql`
    SELECT
      cs.id,
      cs.slug,
      cs.sectie_type,
      cs.titel,
      cs.volgorde,
      cs.inhoud
    FROM cursus_secties cs
    JOIN cursus_lessen cl ON cl.id = cs.les_id
    WHERE cl.slug = 'les-1-1'
      AND cl.cursus_id = (SELECT id FROM cursussen WHERE slug = 'dating-fundament-pro')
    ORDER BY cs.volgorde
  `;

  console.log('\n📊 Les 1-1 "Wat Zoek Je Écht?" - Database Secties:\n');

  secties.forEach((s, i) => {
    console.log(`${i + 1}. ${s.slug} (${s.sectie_type})`);
    console.log(`   Titel: ${s.titel}`);
    console.log(`   Inhoud keys: ${Object.keys(s.inhoud).join(', ')}`);
    console.log(`   Preview:`, JSON.stringify(s.inhoud).substring(0, 150));
    console.log('');
  });

  console.log(`\nTotaal: ${secties.length} secties in database\n`);
}

check();
