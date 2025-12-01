const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkInhoud() {
  const secties = await sql`
    SELECT
      cs.slug,
      cs.sectie_type,
      cs.titel,
      cs.inhoud
    FROM cursus_secties cs
    JOIN cursus_lessen cl ON cl.id = cs.les_id
    WHERE cl.slug = 'les-1-1-hechtingskaart'
    ORDER BY cs.volgorde
  `;

  console.log('\n📊 Secties structuur voor Les 1-1:\n');

  secties.forEach((s, i) => {
    console.log(`${i + 1}. ${s.slug} (${s.sectie_type})`);
    console.log(`   Titel: ${s.titel}`);
    console.log(`   Inhoud keys: ${Object.keys(s.inhoud).join(', ')}`);
    console.log(`   Inhoud:`, JSON.stringify(s.inhoud, null, 2).substring(0, 200));
    console.log('');
  });
}

checkInhoud();
