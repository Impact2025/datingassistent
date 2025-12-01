const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  console.log('\n📊 Dating Fundament PRO - Secties Check\n');

  // Count secties per les
  const result = await sql`
    SELECT
      cl.volgorde,
      cl.slug,
      cl.titel,
      COUNT(cs.id) as secties_count
    FROM cursus_lessen cl
    LEFT JOIN cursus_secties cs ON cs.les_id = cl.id
    WHERE cl.cursus_id = (SELECT id FROM cursussen WHERE slug = 'dating-fundament-pro')
    GROUP BY cl.id, cl.slug, cl.titel, cl.volgorde
    ORDER BY cl.volgorde
  `;

  console.log('Secties per Les:\n');
  result.forEach(row => {
    const icon = row.secties_count >= 4 ? '✅' : '⚠️';
    console.log(`  ${icon} Les ${row.volgorde}: ${row.titel.substring(0, 40).padEnd(40)} → ${row.secties_count} secties`);
  });

  // Total stats
  const totals = await sql`
    SELECT
      COUNT(DISTINCT cs.id) as total_secties,
      COUNT(DISTINCT cl.id) as total_lessen
    FROM cursus_lessen cl
    LEFT JOIN cursus_secties cs ON cs.les_id = cl.id
    WHERE cl.cursus_id = (SELECT id FROM cursussen WHERE slug = 'dating-fundament-pro')
  `;

  console.log(`\n📈 Totalen:`);
  console.log(`  Lessen: ${totals[0].total_lessen}`);
  console.log(`  Secties: ${totals[0].total_secties}`);
  if (totals[0].total_lessen > 0) {
    console.log(`  Gemiddeld: ${Math.round(totals[0].total_secties / totals[0].total_lessen)} secties per les`);
  }

  // Check if JSON files need to be imported
  const lessenZonderSecties = result.filter(r => r.secties_count === 0).length;

  console.log(`\n⚠️  Lessen zonder secties: ${lessenZonderSecties}`);

  if (lessenZonderSecties > 0) {
    console.log('\n💡 Actie vereist: Run import script voor Dating Fundament PRO\n');
  } else {
    console.log('\n✅ Alle lessen hebben secties!\n');
  }
}

check();
