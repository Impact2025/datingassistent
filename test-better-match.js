const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  const client = await pool.connect();
  try {
    const slug = 'je-profieltekst-die-wel-werkt';
    
    // Try different patterns
    const patterns = [
      slug.replace(/-/g, '.*'),  // Current
      'profieltekst.*die.*wel.*werkt',  // Without 'je'
      'profieltekst.*die.*w[eé]l.*werkt', // With accent handling
    ];

    for (const pattern of patterns) {
      console.log(`\nTrying pattern: ${pattern}`);
      const result = await client.query(`
        SELECT id, title FROM courses
        WHERE title ~* $1
          AND is_published = true
        ORDER BY created_at DESC
        LIMIT 1
      `, [pattern]);
      
      console.log('Found:', result.rows.length > 0 ? result.rows[0].title : 'NONE');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

test().catch(console.error);
