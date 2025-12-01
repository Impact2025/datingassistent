const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n🔍 Checking "Het Probleem Met \'Gewoon Iemand\'" sectie...\n');

  const secties = await sql`
    SELECT
      cs.id,
      cs.slug,
      cs.sectie_type,
      cs.titel,
      cs.volgorde,
      cs.inhoud,
      cl.slug as les_slug,
      cl.titel as les_titel,
      c.slug as cursus_slug
    FROM cursus_secties cs
    JOIN cursus_lessen cl ON cl.id = cs.les_id
    JOIN cursussen c ON c.id = cl.cursus_id
    WHERE cs.titel ILIKE '%probleem%gewoon%iemand%'
       OR cs.slug ILIKE '%probleem%gewoon%'
    ORDER BY cs.volgorde
  `;

  if (secties.length === 0) {
    console.log('❌ Sectie niet gevonden in database\n');
    return;
  }

  secties.forEach((s, i) => {
    console.log(`\n📝 Sectie ${i + 1}:`);
    console.log(`   ID: ${s.id}`);
    console.log(`   Slug: ${s.slug}`);
    console.log(`   Type: ${s.sectie_type}`);
    console.log(`   Titel: ${s.titel}`);
    console.log(`   Les: ${s.les_titel} (${s.les_slug})`);
    console.log(`   Cursus: ${s.cursus_slug}`);
    console.log(`   Volgorde: ${s.volgorde}`);
    console.log(`\n   📦 Inhoud structure:`);

    if (!s.inhoud) {
      console.log(`   ❌ LEEG - Geen inhoud!`);
    } else {
      console.log(`   Keys: ${Object.keys(s.inhoud).join(', ')}`);

      // Check for different possible content fields
      if (s.inhoud.items) {
        console.log(`   ✅ items array: ${s.inhoud.items.length} items`);
        s.inhoud.items.forEach((item, idx) => {
          console.log(`      ${idx + 1}. ${item.naam || item.titel || JSON.stringify(item).substring(0, 50)}`);
        });
      }
      if (s.inhoud.punten) {
        console.log(`   ✅ punten array: ${s.inhoud.punten.length} punten`);
        s.inhoud.punten.forEach((punt, idx) => {
          console.log(`      ${idx + 1}. ${punt.naam || punt.titel || JSON.stringify(punt).substring(0, 50)}`);
        });
      }
      if (s.inhoud.tekst) {
        console.log(`   ✅ tekst: ${s.inhoud.tekst.substring(0, 100)}...`);
      }
      if (s.inhoud.body) {
        console.log(`   ✅ body: ${s.inhoud.body.substring(0, 100)}...`);
      }

      console.log(`\n   📄 Full inhoud JSON:`);
      console.log(JSON.stringify(s.inhoud, null, 2));
    }
  });

  console.log('\n');
}

check().catch(console.error);
