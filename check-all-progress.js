const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const cursusId = 1; // profielfoto-5-stappen
  
  const progress = await sql`
    SELECT sp.user_id, COUNT(*) as completed_secties, sp.is_completed
    FROM user_sectie_progress sp
    WHERE sp.cursus_id = ${cursusId}
    GROUP BY sp.user_id, sp.is_completed
  `;
  
  console.log('Progress by user:', JSON.stringify(progress, null, 2));
  
  // Get all progress details
  const allProgress = await sql`
    SELECT sp.user_id, sp.sectie_id, sp.is_completed, cl.titel as les_titel, cs.titel as sectie_titel
    FROM user_sectie_progress sp
    JOIN cursus_secties cs ON cs.id = sp.sectie_id
    JOIN cursus_lessen cl ON cl.id = sp.les_id
    WHERE sp.cursus_id = ${cursusId}
    ORDER BY sp.user_id, cl.volgorde, cs.volgorde
  `;
  
  console.log('\nTotal progress entries:', allProgress.length);
  console.log('Progress details:', JSON.stringify(allProgress, null, 2));
})();
