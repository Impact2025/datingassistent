const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function verify() {
  console.log('\n🔍 Verificatie Import Results\n');

  // Count secties per les
  const result = await sql`
    SELECT
      cl.volgorde,
      cl.titel as les_titel,
      COUNT(cs.id) as secties_count
    FROM cursus_lessen cl
    LEFT JOIN cursus_secties cs ON cs.les_id = cl.id
    WHERE cl.cursus_id = (SELECT id FROM cursussen WHERE slug = 'meesterschap-in-relaties')
    GROUP BY cl.id, cl.titel, cl.volgorde
    ORDER BY cl.volgorde
  `;

  console.log('📊 Secties per Les:\n');
  result.forEach(row => {
    const icon = row.secties_count >= 4 ? '✅' : '⚠️';
    console.log(`  ${icon} Les ${row.volgorde}: ${row.les_titel.substring(0, 45).padEnd(45)} → ${row.secties_count} secties`);
  });

  // Total stats
  const totals = await sql`
    SELECT
      COUNT(DISTINCT cs.id) as total_secties,
      COUNT(DISTINCT cl.id) as total_lessen
    FROM cursus_lessen cl
    LEFT JOIN cursus_secties cs ON cs.les_id = cl.id
    WHERE cl.cursus_id = (SELECT id FROM cursussen WHERE slug = 'meesterschap-in-relaties')
  `;

  console.log(`\n📈 Totalen:`);
  console.log(`  Lessen: ${totals[0].total_lessen}`);
  console.log(`  Secties: ${totals[0].total_secties}`);
  console.log(`  Gemiddeld: ${Math.round(totals[0].total_secties / totals[0].total_lessen)} secties per les\n`);

  // Sample a section to see structure
  const sample = await sql`
    SELECT cs.*, cl.titel as les_titel
    FROM cursus_secties cs
    JOIN cursus_lessen cl ON cl.id = cs.les_id
    WHERE cl.cursus_id = (SELECT id FROM cursussen WHERE slug = 'meesterschap-in-relaties')
    LIMIT 1
  `;

  if (sample.length > 0) {
    console.log('🔬 Voorbeeld sectie:\n');
    console.log(`  Les: ${sample[0].les_titel}`);
    console.log(`  Sectie: ${sample[0].slug} (${sample[0].sectie_type})`);
    console.log(`  Titel: ${sample[0].titel || 'Geen titel'}`);
    console.log(`  Inhoud keys: ${Object.keys(sample[0].inhoud).join(', ')}\n`);
  }
}

verify();
