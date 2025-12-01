const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const cursusId = 1; // profielfoto-5-stappen
  
  const lessen = await sql`
    SELECT id, slug, titel, volgorde 
    FROM cursus_lessen 
    WHERE cursus_id = ${cursusId}
    ORDER BY volgorde
  `;
  
  console.log('Lessen:', JSON.stringify(lessen, null, 2));
  
  // Check secties
  for (const les of lessen) {
    const secties = await sql`
      SELECT id, sectie_type, titel, volgorde
      FROM cursus_secties
      WHERE les_id = ${les.id}
      ORDER BY volgorde
    `;
    console.log(`\nLes ${les.volgorde} (${les.titel}): ${secties.length} secties`);
  }
  
  // Check progress for user 122
  const progress = await sql`
    SELECT sp.*, cs.titel as sectie_titel, cl.titel as les_titel
    FROM user_sectie_progress sp
    JOIN cursus_secties cs ON cs.id = sp.sectie_id
    JOIN cursus_lessen cl ON cl.id = sp.les_id
    WHERE sp.cursus_id = ${cursusId} AND sp.user_id = 122
  `;
  
  console.log('\nProgress for user 122:', progress.length, 'secties completed');
})();
