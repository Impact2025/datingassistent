const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const lessen = await sql`
    SELECT slug, titel, volgorde
    FROM cursus_lessen
    WHERE cursus_id = (SELECT id FROM cursussen WHERE slug = 'meesterschap-in-relaties')
    ORDER BY volgorde
    LIMIT 10
  `;

  console.log('Database slugs:');
  lessen.forEach(les => {
    console.log(`  ${les.volgorde}. ${les.slug} - ${les.titel}`);
  });
}

main();
