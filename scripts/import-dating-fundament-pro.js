const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.DATABASE_URL);

// 🎯 TYPE MAPPING: JSON type → Component type
const TYPE_TO_COMPONENT_MAP = {
  // Pattern 1: Comparison (ComparisonSectie)
  'framework': 'comparison',
  'contrast': 'comparison',
  'transformatie': 'comparison',
  'myth-bust': 'comparison',
  'mindset': 'comparison',

  // Pattern 2: Insight (InsightSectie)
  'insight': 'insight',
  'wetenschap': 'insight',
  'analyse': 'insight',
  'uitleg': 'insight',
  'regel': 'insight',
  'concept': 'insight',

  // Pattern 3: Examples (ExamplesSectie)
  'voorbeelden': 'examples',
  'praktijk': 'examples',
  'skill': 'examples',
  'techniek': 'examples',
  'template': 'examples',

  // Pattern 4: Interactive (InteractiveSectie)
  'hook': 'tekst', // hook has opties which TekstSectie handles
  'zelfreflectie': 'interactive',
  'reflectie': 'interactive',
  'check-in': 'interactive',

  // Legacy types (keep as-is for now)
  'video': 'video',
  'tekst': 'tekst',
  'kernpunten': 'kernpunten',
  'quiz': 'quiz',
  'opdracht': 'opdracht',

  // Fallback to 'tekst' for unmapped types
  // We'll handle these manually later
};

function mapType(jsonType) {
  return TYPE_TO_COMPONENT_MAP[jsonType] || 'tekst';
}

function normalizeContent(type, content) {
  // Content is already in good shape, just return as-is
  // The components are designed to handle the various structures flexibly
  return content;
}

async function importDatingFundamentPro() {
  console.log('\n🚀 SMART IMPORT: Dating Fundament PRO\n');

  const baseDir = path.join(__dirname, '../cursussen/cursussen/dating-fundament-pro');

  // 1. Get cursus ID
  const [cursus] = await sql`
    SELECT id FROM cursussen WHERE slug = 'dating-fundament-pro'
  `;

  if (!cursus) {
    console.error('❌ Cursus "dating-fundament-pro" not found in database');
    return;
  }

  const cursusId = cursus.id;
  console.log(`✅ Found cursus: dating-fundament-pro (ID: ${cursusId})\n`);

  // 2. Scan all modules and lessons
  const modules = fs.readdirSync(baseDir)
    .filter(name => name.startsWith('module-'))
    .sort();

  let globalLesVolgorde = 1;
  const stats = {
    lessen: 0,
    secties: 0,
    byType: {}
  };

  for (const moduleDir of modules) {
    const modulePath = path.join(baseDir, moduleDir);
    if (!fs.statSync(modulePath).isDirectory()) continue;

    const lessen = fs.readdirSync(modulePath)
      .filter(name => name.startsWith('les-'))
      .sort();

    for (const lesDir of lessen) {
      const lesPath = path.join(modulePath, lesDir);
      const lesJsonPath = path.join(lesPath, 'les.json');

      if (!fs.existsSync(lesJsonPath)) continue;

      const lesData = JSON.parse(fs.readFileSync(lesJsonPath, 'utf-8'));
      const meta = lesData.meta || {};

      console.log(`\n📝 Importing: ${meta.titel || lesDir}`);
      console.log(`   Volgorde: ${globalLesVolgorde}`);

      // Insert/update lesson
      const [les] = await sql`
        INSERT INTO cursus_lessen (
          cursus_id,
          slug,
          titel,
          beschrijving,
          volgorde,
          duur_minuten
        ) VALUES (
          ${cursusId},
          ${meta.id || lesDir},
          ${meta.titel || lesDir},
          ${meta.subtitel || meta.kernvraag || ''},
          ${globalLesVolgorde},
          ${meta.duur_minuten || 20}
        )
        ON CONFLICT (cursus_id, slug)
        DO UPDATE SET
          titel = EXCLUDED.titel,
          beschrijving = EXCLUDED.beschrijving,
          volgorde = EXCLUDED.volgorde,
          duur_minuten = EXCLUDED.duur_minuten
        RETURNING id
      `;

      const lesId = les.id;
      stats.lessen++;

      // Import secties
      const secties = lesData.secties || [];
      console.log(`   Secties: ${secties.length}`);

      for (let i = 0; i < secties.length; i++) {
        const sectie = secties[i];
        const jsonType = sectie.type || 'tekst';
        const componentType = mapType(jsonType);
        const content = normalizeContent(jsonType, sectie.content || {});

        // Generate slug
        const slug = sectie.id || `sectie-${i + 1}`;

        try {
          await sql`
            INSERT INTO cursus_secties (
              les_id,
              slug,
              sectie_type,
              titel,
              volgorde,
              inhoud
            ) VALUES (
              ${lesId},
              ${slug},
              ${componentType},
              ${sectie.titel || ''},
              ${i + 1},
              ${JSON.stringify(content)}::jsonb
            )
            ON CONFLICT (les_id, slug)
            DO UPDATE SET
              sectie_type = EXCLUDED.sectie_type,
              titel = EXCLUDED.titel,
              volgorde = EXCLUDED.volgorde,
              inhoud = EXCLUDED.inhoud
          `;

          stats.secties++;
          stats.byType[componentType] = (stats.byType[componentType] || 0) + 1;

          console.log(`      ${i + 1}. ${slug} (${jsonType} → ${componentType})`);
        } catch (err) {
          console.error(`      ❌ Error importing sectie ${slug}:`, err.message);
        }
      }

      globalLesVolgorde++;
    }
  }

  // 3. Print summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📊 IMPORT SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Lessen imported: ${stats.lessen}`);
  console.log(`✅ Secties imported: ${stats.secties}`);
  console.log(`\n📈 Secties by type:`);

  Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type.padEnd(15)} : ${count}`);
    });

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Import completed successfully!');
  console.log(`${'='.repeat(60)}\n`);
}

// Run import
importDatingFundamentPro().catch(err => {
  console.error('\n❌ Import failed:', err);
  process.exit(1);
});
