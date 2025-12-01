import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL!);

/**
 * POST /api/admin/import-cursus
 * Import Dating Fundament PRO cursus van JSON bestanden naar database
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth (simpele check voor nu)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      // Voor development, sta toe zonder auth
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { action = 'import', cursusId = 'dating-fundament-pro' } = body;

    if (action === 'check') {
      // Check of cursus al bestaat
      const existing = await sql`
        SELECT id, slug, titel FROM cursussen WHERE slug = ${cursusId}
      `;
      return NextResponse.json({
        exists: existing.length > 0,
        cursus: existing[0] || null
      });
    }

    // Lees cursus structuur JSON
    const cursusStructuurPath = path.join(
      process.cwd(),
      'cursussen/cursussen/dating-fundament-pro/cursus-structuur.json'
    );

    const cursusStructuur = JSON.parse(fs.readFileSync(cursusStructuurPath, 'utf-8'));
    const { cursus: cursusData, modules } = cursusStructuur;

    console.log('📚 Importing cursus:', cursusData.titel);

    // 1. Maak of update cursus record
    const cursusResult = await sql`
      INSERT INTO cursussen (
        slug,
        titel,
        subtitel,
        cursus_type,
        prijs,
        beschrijving,
        beschrijving_lang,
        doelen,
        duur_minuten,
        niveau,
        gekoppelde_tools,
        status,
        gepubliceerd_op
      ) VALUES (
        ${cursusData.id},
        ${cursusData.titel},
        ${cursusData.subtitel},
        'expert',
        ${cursusData.prijs},
        ${cursusData.beschrijving.kort},
        ${cursusData.beschrijving.lang},
        ${JSON.stringify(cursusData.resultaten)},
        ${Math.round(cursusData.duur_uren * 60)},
        ${cursusData.niveau === 'beginner-intermediate' ? 'intermediate' : cursusData.niveau},
        ${JSON.stringify(['profiel-coach', 'chat-coach', 'bio-generator'])},
        'published',
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        titel = EXCLUDED.titel,
        subtitel = EXCLUDED.subtitel,
        prijs = EXCLUDED.prijs,
        beschrijving = EXCLUDED.beschrijving,
        beschrijving_lang = EXCLUDED.beschrijving_lang,
        doelen = EXCLUDED.doelen,
        duur_minuten = EXCLUDED.duur_minuten,
        updated_at = NOW()
      RETURNING id, slug
    `;

    const cursusDbId = cursusResult[0].id;
    console.log('✅ Cursus created/updated with ID:', cursusDbId);

    // 2. Verwijder bestaande lessen en secties voor deze cursus (voor clean re-import)
    console.log('🗑️ Removing existing lessen for clean import...');

    try {
      // Eerst quiz vragen verwijderen (vanwege foreign key)
      await sql`
        DELETE FROM cursus_quiz_vragen
        WHERE sectie_id IN (
          SELECT cs.id FROM cursus_secties cs
          JOIN cursus_lessen cl ON cs.les_id = cl.id
          WHERE cl.cursus_id = ${cursusDbId}
        )
      `;
      console.log('✅ Quiz vragen removed');
    } catch (e: any) {
      console.log('⚠️ Quiz vragen table may not exist:', e.message);
    }

    try {
      // Dan secties verwijderen
      await sql`
        DELETE FROM cursus_secties
        WHERE les_id IN (
          SELECT id FROM cursus_lessen WHERE cursus_id = ${cursusDbId}
        )
      `;
      console.log('✅ Secties removed');
    } catch (e: any) {
      console.log('⚠️ Secties table may not exist:', e.message);
    }

    try {
      // Dan lessen verwijderen
      await sql`DELETE FROM cursus_lessen WHERE cursus_id = ${cursusDbId}`;
      console.log('✅ Lessen removed');
    } catch (e: any) {
      console.log('⚠️ Lessen table may not exist:', e.message);
    }

    console.log('✅ Existing data cleanup complete');

    // 3. Import alle modules en lessen
    let lesVolgorde = 1;
    const importResults: any[] = [];

    for (const module of modules) {
      console.log(`\n📦 Processing module ${module.nummer}: ${module.titel}`);

      for (const lesConfig of module.lessen) {
        // Probeer les.json te lezen als het bestaat
        const lesJsonPath = path.join(
          process.cwd(),
          `cursussen/cursussen/dating-fundament-pro/module-${module.nummer}/${lesConfig.id}/les.json`
        );

        let lesData: any = null;
        try {
          lesData = JSON.parse(fs.readFileSync(lesJsonPath, 'utf-8'));
        } catch (e) {
          console.log(`  ⚠️ No les.json for ${lesConfig.id}, using config only`);
        }

        // Maak les slug
        const lesSlug = lesConfig.id;
        const lesTitel = lesData?.meta?.titel || lesConfig.titel;
        const lesBeschrijving = lesData?.meta?.subtitel || lesConfig.subtitel;
        const lesDuur = lesData?.meta?.duur_minuten || lesConfig.duur_min;
        const aiCoachContext = lesData?.reflectie?.ai_coach_context || lesConfig.kernvraag;

        // Insert les (bestaande zijn al verwijderd)
        const lesResult = await sql`
          INSERT INTO cursus_lessen (
            cursus_id,
            slug,
            titel,
            volgorde,
            beschrijving,
            duur_minuten,
            ai_coach_actief,
            ai_coach_context,
            status
          ) VALUES (
            ${cursusDbId},
            ${lesSlug},
            ${lesTitel},
            ${lesVolgorde},
            ${lesBeschrijving},
            ${lesDuur},
            true,
            ${aiCoachContext},
            'published'
          )
          RETURNING id, slug
        `;

        const lesDbId = lesResult[0].id;
        console.log(`  ✅ Les ${lesVolgorde}: ${lesTitel} (ID: ${lesDbId})`);

        // 3. Import secties als les.json bestaat
        if (lesData?.secties) {
          // Verwijder eerst oude secties
          await sql`DELETE FROM cursus_secties WHERE les_id = ${lesDbId}`;

          let sectieVolgorde = 1;
          for (const sectie of lesData.secties) {
            const sectieType = mapSectieType(sectie.type || sectie.sectie_type);
            const sectieInhoud = buildSectieInhoud(sectie);

            await sql`
              INSERT INTO cursus_secties (
                les_id,
                slug,
                sectie_type,
                titel,
                inhoud,
                volgorde
              ) VALUES (
                ${lesDbId},
                ${sectie.id},
                ${sectieType},
                ${sectie.titel || null},
                ${JSON.stringify(sectieInhoud)},
                ${sectieVolgorde}
              )
            `;

            sectieVolgorde++;
          }
          console.log(`    📝 ${sectieVolgorde - 1} secties imported`);
        }

        // 4. Import quiz vragen als die bestaan
        if (lesData?.quiz?.vragen) {
          // Zoek quiz sectie
          const quizSectieResult = await sql`
            SELECT id FROM cursus_secties
            WHERE les_id = ${lesDbId} AND sectie_type = 'quiz'
            LIMIT 1
          `;

          if (quizSectieResult.length > 0) {
            const quizSectieId = quizSectieResult[0].id;

            // Verwijder oude vragen
            await sql`DELETE FROM cursus_quiz_vragen WHERE sectie_id = ${quizSectieId}`;

            let vraagVolgorde = 1;
            for (const vraag of lesData.quiz.vragen) {
              const opties = vraag.opties.map((optie: string, idx: number) => ({
                id: `opt-${idx}`,
                tekst: optie,
                correct: idx === vraag.correct
              }));

              await sql`
                INSERT INTO cursus_quiz_vragen (
                  sectie_id,
                  vraag,
                  vraag_type,
                  opties,
                  uitleg_correct,
                  volgorde
                ) VALUES (
                  ${quizSectieId},
                  ${vraag.vraag},
                  'multiple-choice',
                  ${JSON.stringify(opties)},
                  ${vraag.feedback || null},
                  ${vraagVolgorde}
                )
              `;
              vraagVolgorde++;
            }
            console.log(`    ❓ ${vraagVolgorde - 1} quiz vragen imported`);
          }
        }

        importResults.push({
          les: lesSlug,
          titel: lesTitel,
          sectieCount: lesData?.secties?.length || 0
        });

        lesVolgorde++;
      }
    }

    return NextResponse.json({
      success: true,
      cursus: {
        id: cursusDbId,
        slug: cursusData.id,
        titel: cursusData.titel
      },
      imported: {
        lessen: lesVolgorde - 1,
        details: importResults
      }
    });

  } catch (error: any) {
    console.error('❌ Import error:', error);
    return NextResponse.json({
      error: 'Import failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

/**
 * Map nieuwe sectie types naar bestaande database types
 */
function mapSectieType(type: string): string {
  const typeMap: Record<string, string> = {
    // Direct mappings
    'video': 'video',
    'tekst': 'tekst',
    'kernpunten': 'kernpunten',
    'quiz': 'quiz',
    'reflectie': 'reflectie',
    'opdracht': 'opdracht',
    'tool': 'tool',
    'tip': 'tip',
    'actieplan': 'actieplan',

    // New types from les.json -> map to closest existing
    'content': 'tekst',
    'hook': 'tekst',
    'insight': 'kernpunten',
    'framework': 'kernpunten',
    'zelfreflectie': 'reflectie',
    'transformatie': 'kernpunten',
    'praktijk': 'tekst',
    'oefening': 'opdracht',
  };

  return typeMap[type] || 'tekst';
}

/**
 * Build sectie inhoud object based on sectie type
 */
function buildSectieInhoud(sectie: any): any {
  const type = sectie.type || sectie.sectie_type;

  switch (type) {
    case 'video':
      return {
        introTekst: sectie.transcript_preview || sectie.beschrijving,
        videoUrl: sectie.video_url || null,
        videoId: sectie.video_id,
        duurSeconden: sectie.duur_seconden
      };

    case 'content':
    case 'tekst':
      // Content sectie heeft vaak een inhoud array
      if (Array.isArray(sectie.inhoud)) {
        return {
          body: sectie.inhoud.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.tekst) return item.tekst;
            if (item.type === 'intro_tekst') return item.tekst;
            if (item.type === 'kernpunt') return `**${item.tekst}**`;
            if (item.type === 'uitleg') return item.tekst;
            if (item.type === 'tip') return `💡 ${item.tekst}`;
            return JSON.stringify(item);
          }).join('\n\n'),
          format: 'markdown'
        };
      }
      return { body: sectie.inhoud || sectie.beschrijving || '' };

    case 'hook':
      return {
        body: sectie.content?.vraag || sectie.beschrijving,
        opties: sectie.content?.opties,
        context: sectie.content?.context
      };

    case 'insight':
    case 'framework':
    case 'transformatie':
    case 'kernpunten':
      // Convert to kernpunten format
      const punten: any[] = [];

      if (sectie.content?.vergelijking) {
        sectie.content.vergelijking.forEach((item: any, idx: number) => {
          punten.push({
            icon: item.kleur === 'success' ? '✅' : '⚠️',
            titel: item.type,
            beschrijving: item.kenmerken?.join(', ') || item.gevolg
          });
        });
      }

      if (sectie.content?.van_naar) {
        sectie.content.van_naar.forEach((item: any) => {
          punten.push({
            icon: '➡️',
            titel: `${item.van} → ${item.naar}`,
            beschrijving: item.waarom
          });
        });
      }

      if (Array.isArray(sectie.inhoud)) {
        sectie.inhoud.forEach((item: any, idx: number) => {
          if (item.type === 'voorbeelden_slecht') {
            item.items?.forEach((ex: any) => {
              punten.push({
                icon: '❌',
                titel: ex.tekst,
                beschrijving: ex.probleem
              });
            });
          }
          if (item.type === 'voorbeelden_goed') {
            item.items?.forEach((ex: any) => {
              punten.push({
                icon: '✅',
                titel: 'Voorbeeld',
                beschrijving: ex.bio
              });
            });
          }
          if (item.type === 'formule_stappen') {
            item.stappen?.forEach((stap: any) => {
              punten.push({
                icon: `${stap.nummer}️⃣`,
                titel: stap.naam,
                beschrijving: `${stap.beschrijving}\n\nVoorbeeld: "${stap.voorbeeld}"`
              });
            });
          }
          if (item.type === 'vergelijking' && item.kolommen) {
            item.kolommen.forEach((col: any) => {
              punten.push({
                icon: col.kleur === 'groen' ? '✅' : '❌',
                titel: col.label,
                beschrijving: col.items?.join('\n• ') || ''
              });
            });
          }
          if (item.type === 'vermijd_lijst') {
            item.items?.forEach((vermijd: any) => {
              punten.push({
                icon: vermijd.icon || '⚠️',
                titel: vermijd.naam,
                beschrijving: `"${vermijd.voorbeeld}" - ${vermijd.waarom_slecht}`
              });
            });
          }
        });
      }

      return {
        punten: punten.length > 0 ? punten : [{
          icon: '📌',
          titel: sectie.titel || 'Kernpunt',
          beschrijving: sectie.content?.intro || sectie.content?.conclusie || ''
        }]
      };

    case 'zelfreflectie':
    case 'reflectie':
      const vragen: string[] = [];

      if (sectie.content?.vragen) {
        sectie.content.vragen.forEach((v: any) => {
          vragen.push(v.vraag || v);
        });
      }

      return {
        vragen: vragen.length > 0 ? vragen : [sectie.content?.intro || 'Reflecteer op deze les'],
        aiAnalyse: true
      };

    case 'praktijk':
      return {
        body: sectie.content?.intro || '',
        voorbeelden: sectie.content?.voorbeelden
      };

    case 'oefening':
    case 'opdracht':
      const taken: string[] = [];

      if (sectie.content?.categorieen) {
        sectie.content.categorieen.forEach((cat: any) => {
          taken.push(`**${cat.naam}**: ${cat.beschrijving}`);
        });
      }

      if (Array.isArray(sectie.inhoud)) {
        sectie.inhoud.forEach((item: any) => {
          if (item.type === 'stappen') {
            item.items?.forEach((stap: any) => {
              taken.push(typeof stap === 'string' ? stap : stap.tekst);
            });
          }
        });
      }

      return {
        taken: taken.length > 0 ? taken : ['Voltooi deze opdracht'],
        tijdsduur: sectie.content?.tijdsduur
      };

    default:
      return sectie.inhoud || sectie.content || {};
  }
}

/**
 * GET /api/admin/import-cursus
 * Check import status
 */
export async function GET() {
  try {
    const cursussen = await sql`
      SELECT c.id, c.slug, c.titel, c.status,
             COUNT(cl.id) as lessen_count
      FROM cursussen c
      LEFT JOIN cursus_lessen cl ON cl.cursus_id = c.id
      WHERE c.slug = 'dating-fundament-pro'
      GROUP BY c.id
    `;

    return NextResponse.json({
      cursus: cursussen[0] || null,
      imported: cursussen.length > 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
