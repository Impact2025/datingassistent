const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const secties = await sql`
    SELECT
      cs.id,
      cs.slug,
      cs.sectie_type,
      cs.titel,
      cs.inhoud
    FROM cursus_secties cs
    JOIN cursus_lessen cl ON cl.id = cs.les_id
    WHERE cl.volgorde = 2
      AND cl.cursus_id = (SELECT id FROM cursussen WHERE slug = 'dating-fundament-pro')
    ORDER BY cs.volgorde
  `;

  console.log('\n📝 Les 2: De Mythe van De Vonk - Secties:\n');

  secties.forEach((s, i) => {
    console.log(`\n${i + 1}. ${s.slug} (${s.sectie_type})`);
    console.log(`   Titel: ${s.titel || '(geen titel)'}`);
    console.log(`   Inhoud keys: ${Object.keys(s.inhoud).join(', ')}`);

    // Show structure preview
    if (s.sectie_type === 'insight' || s.sectie_type === 'comparison') {
      console.log(`   Preview:`, JSON.stringify(s.inhoud).substring(0, 200) + '...');
    }
  });

  console.log('\n');
}

check();
