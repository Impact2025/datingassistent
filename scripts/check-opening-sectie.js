const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const [sectie] = await sql`
    SELECT
      cs.id,
      cs.slug,
      cs.sectie_type,
      cs.titel,
      cs.inhoud
    FROM cursus_secties cs
    JOIN cursus_lessen cl ON cl.id = cs.les_id
    WHERE cs.slug = 'opening'
      AND cl.slug = 'les-1-1'
      AND cl.cursus_id = (SELECT id FROM cursussen WHERE slug = 'dating-fundament-pro')
  `;

  console.log('\n📝 Opening Section (Waarom wil je daten?):\n');
  console.log('Type:', sectie.sectie_type);
  console.log('Titel:', sectie.titel);
  console.log('\nInhoud:');
  console.log(JSON.stringify(sectie.inhoud, null, 2));
  console.log('\n');

  // Check if opties exists
  if (sectie.inhoud.opties) {
    console.log('✅ Opties found:', sectie.inhoud.opties.length);
    sectie.inhoud.opties.forEach((opt, i) => {
      console.log(`  ${i + 1}. ${opt.tekst || opt}`);
    });
  } else {
    console.log('❌ No opties field found');
    console.log('Available fields:', Object.keys(sectie.inhoud).join(', '));
  }
  console.log('\n');
}

check();
