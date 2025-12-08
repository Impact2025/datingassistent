import { sql } from '@vercel/postgres';

async function checkCursus() {
  try {
    console.log('🔍 Checking profielfoto cursus...\n');

    // Check alle cursussen
    const alleCursussen = await sql`
      SELECT id, slug, titel, status
      FROM cursussen
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('📚 Alle cursussen in database:', alleCursussen.rows);

    // Check specifiek profielfoto cursus met beide slugs
    const cursusResult = await sql`
      SELECT id, slug, titel, status
      FROM cursussen
      WHERE slug = 'profielfoto' OR slug = 'profielfoto-5-stappen' OR titel LIKE '%profielfoto%'
    `;

    console.log('\n📸 Profielfoto cursus gevonden:', cursusResult.rows);

    if (cursusResult.rows.length > 0) {
      const cursusId = cursusResult.rows[0].id;

      // Check lessen
      const lessenResult = await sql`
        SELECT id, slug, titel, volgorde, status
        FROM cursus_lessen
        WHERE cursus_id = ${cursusId}
        ORDER BY volgorde ASC
      `;

      console.log('\n📖 Lessen gevonden:', lessenResult.rows);

      if (lessenResult.rows.length > 0) {
        // Check secties voor eerste les
        const lesId = lessenResult.rows[0].id;
        const sectiesResult = await sql`
          SELECT id, titel, sectie_type, volgorde
          FROM cursus_secties
          WHERE les_id = ${lesId}
          ORDER BY volgorde ASC
        `;

        console.log('\n📝 Secties in eerste les:', sectiesResult.rows);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkCursus();
