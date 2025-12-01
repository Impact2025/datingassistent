const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const cursussen = await sql`
    SELECT id, slug, titel 
    FROM cursussen 
    WHERE titel LIKE '%Profielfoto%' OR slug LIKE '%foto%'
  `;
  console.log(JSON.stringify(cursussen, null, 2));
})();
