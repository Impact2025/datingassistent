import { sql } from '@vercel/postgres';

async function testURLFlow() {
  try {
    console.log('🧪 Testing URL flow for profielfoto cursus...\n');

    // 1. Simulate clicking "De Perfecte Profielfoto in 5 Stappen"
    const cursusSlug = 'profielfoto-5-stappen';
    console.log(`1️⃣ User clicks cursus with slug: ${cursusSlug}`);
    console.log(`   → Navigeert naar: /cursussen/${cursusSlug}\n`);

    // 2. Check if cursus exists
    const cursusResult = await sql`
      SELECT id, slug, titel FROM cursussen
      WHERE slug = ${cursusSlug} AND status = 'published'
    `;

    if (cursusResult.rows.length === 0) {
      console.log('❌ Cursus niet gevonden in database!\n');
      return;
    }

    const cursus = cursusResult.rows[0];
    console.log('✅ Cursus gevonden:', cursus);

    // 3. Get lessons
    const lessenResult = await sql`
      SELECT id, slug, titel, volgorde FROM cursus_lessen
      WHERE cursus_id = ${cursus.id}
      ORDER BY volgorde ASC
    `;

    console.log(`\n2️⃣ Lessen in cursus:`, lessenResult.rows);

    // 4. Simulate clicking on first lesson "Start les"
    const eersteLes = lessenResult.rows[0];
    console.log(`\n3️⃣ User clicks "Start les" on: ${eersteLes.titel}`);
    console.log(`   → Expected URL: /cursussen/${cursusSlug}/${eersteLes.slug}`);
    console.log(`   → Actual URL used in code: /cursussen/\${slug}/\${les.slug}`);

    // 5. Test if API route would work
    console.log(`\n4️⃣ Testing API route: /api/cursussen/${cursusSlug}/${eersteLes.slug}`);

    // Simulate the API route check
    const apiCursusCheck = await sql`
      SELECT * FROM cursussen
      WHERE slug = ${cursusSlug} AND status = 'published'
    `;

    if (apiCursusCheck.rows.length === 0) {
      console.log('❌ API: Cursus niet gevonden');
    } else {
      console.log('✅ API: Cursus found');

      const apiLesCheck = await sql`
        SELECT * FROM cursus_lessen
        WHERE cursus_id = ${apiCursusCheck.rows[0].id}
          AND slug = ${eersteLes.slug}
          AND status = 'published'
      `;

      if (apiLesCheck.rows.length === 0) {
        console.log('❌ API: Les niet gevonden');
      } else {
        console.log('✅ API: Les found');
      }
    }

    console.log('\n5️⃣ CONCLUSIE:');
    console.log('De complete URL flow zou moeten werken:');
    console.log(`/cursussen/${cursusSlug} → Les detail pagina`);
    console.log(`/cursussen/${cursusSlug}/${eersteLes.slug} → Les viewer`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testURLFlow();
