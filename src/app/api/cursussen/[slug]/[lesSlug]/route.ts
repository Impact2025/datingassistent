import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import { verifyToken, cookieConfig } from '@/lib/jwt-config';
import { resolveSlug } from '@/lib/cursus-slug-utils';

/**
 * GET /api/cursussen/[slug]/[lesSlug]
 * Haal specifieke les op met alle secties en quiz vragen
 *
 * ✨ WERELDKLASSE FEATURE: Ondersteunt slug aliases voor backwards compatibility
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lesSlug: string }> }
) {
  try {
    // Fixed: Await params as required by Next.js 15
    const { slug: rawSlug, lesSlug } = await params;

    // Resolve slug to canonical version (supports aliases)
    const slug = resolveSlug(rawSlug);

    if (rawSlug !== slug) {
      console.log(`🔄 Slug alias resolved: ${rawSlug} -> ${slug}`);
    }

    console.log(`🚀 Fetching lesson: ${lesSlug} from course: ${slug}`);

    // 1. Haal cursus op
    const cursusResult = await sql`
      SELECT * FROM cursussen
      WHERE slug = ${slug} AND status = 'published'
    `;

    if (cursusResult.rows.length === 0) {
      return NextResponse.json({ error: 'Cursus niet gevonden' }, { status: 404 });
    }

    const cursus = cursusResult.rows[0];

    // 2. Haal les op
    const lesResult = await sql`
      SELECT * FROM cursus_lessen
      WHERE cursus_id = ${cursus.id}
        AND slug = ${lesSlug}
        AND status = 'published'
    `;

    if (lesResult.rows.length === 0) {
      return NextResponse.json({ error: 'Les niet gevonden' }, { status: 404 });
    }

    const les = lesResult.rows[0];

    // 3. Haal alle secties op voor deze les
    const sectiesResult = await sql`
      SELECT * FROM cursus_secties
      WHERE les_id = ${les.id}
      ORDER BY volgorde ASC
    `;

    // 4. Voor elke quiz sectie, haal de vragen op
    const secties = await Promise.all(
      sectiesResult.rows.map(async (sectie: any) => {
        if (sectie.sectie_type === 'quiz') {
          const vragenResult = await sql`
            SELECT * FROM cursus_quiz_vragen
            WHERE sectie_id = ${sectie.id}
            ORDER BY volgorde ASC
          `;

          console.log(`📝 Loaded ${vragenResult.rows.length} quiz vragen for sectie ${sectie.id}`);

          return {
            ...sectie,
            quiz_vragen: vragenResult.rows
          };
        }

        return sectie;
      })
    );

    // 5. Haal vorige en volgende les op voor navigatie
    const vorige = await sql`
      SELECT id, slug, titel FROM cursus_lessen
      WHERE cursus_id = ${cursus.id}
        AND volgorde < ${les.volgorde}
        AND status = 'published'
      ORDER BY volgorde DESC
      LIMIT 1
    `;

    const volgende = await sql`
      SELECT id, slug, titel FROM cursus_lessen
      WHERE cursus_id = ${cursus.id}
        AND volgorde > ${les.volgorde}
        AND status = 'published'
      ORDER BY volgorde ASC
      LIMIT 1
    `;

    // 6. Haal user progress op via JWT token (consistent met andere routes)
    let userId: number | null = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(cookieConfig.name)?.value;

      if (token) {
        const user = await verifyToken(token);
        userId = user?.id || null;
      }
    } catch (authError) {
      console.log('No authenticated user for lesson request');
    }

    // Als geen user ingelogd, geen progress
    const progressResult = userId ? await sql`
      SELECT * FROM user_sectie_progress
      WHERE les_id = ${les.id}
        AND user_id = ${userId}
    ` : { rows: [] };

    // Bereken les status op basis van voltooide secties
    const voltooideSecties = progressResult.rows.filter((p: any) => p.is_completed).map((p: any) => p.sectie_id);
    const totaalSecties = secties.length;
    const alleSectiesTotalVoltooide = voltooideSecties.length === totaalSecties && totaalSecties > 0;

    let lesStatus = 'niet-gestart';
    if (progressResult.rows.length > 0) {
      lesStatus = alleSectiesTotalVoltooide ? 'afgerond' : 'bezig';
    }

    const userProgress = {
      status: lesStatus,
      voltooide_secties: voltooideSecties,
      laatste_sectie_id: progressResult.rows.length > 0 ? progressResult.rows[progressResult.rows.length - 1].sectie_id : null,
      quiz_scores: progressResult.rows.reduce((acc: any, p: any) => {
        if (p.quiz_score) acc[p.sectie_id] = p.quiz_score;
        return acc;
      }, {})
    };

    // Voeg progress toe aan elke sectie
    const sectiesMetProgress = secties.map((sectie: any) => {
      const progress = progressResult.rows.find((p: any) => p.sectie_id === sectie.id);

      // Parse inhoud if it's a string (JSONB sometimes returns as string)
      let inhoud = sectie.inhoud;
      try {
        if (typeof inhoud === 'string' && inhoud.trim().startsWith('{')) {
          inhoud = JSON.parse(inhoud);
        } else if (!inhoud || typeof inhoud !== 'object') {
          console.warn(`Sectie ${sectie.id} has invalid inhoud type: ${typeof inhoud}`);
          inhoud = {};
        }
      } catch (e) {
        console.error(`Failed to parse inhoud for sectie ${sectie.id}:`, e, 'Value:', inhoud);
        inhoud = {};
      }

      return {
        ...sectie,
        inhoud: inhoud || {},
        user_progress: progress || null
      };
    });

    const lesData = {
      ...les,
      secties: sectiesMetProgress,
      user_progress: userProgress,
      navigatie: {
        vorige: vorige.rows[0] || null,
        volgende: volgende.rows[0] || null
      },
      cursus: {
        id: cursus.id,
        slug: cursus.slug,
        titel: cursus.titel
      }
    };

    console.log(`✅ Lesson fetched: ${les.titel} with ${secties.length} sections`);

    return NextResponse.json({ les: lesData });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cursussen/[slug]/[lesSlug]
 * Update voortgang voor een specifieke sectie
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lesSlug: string }> }
) {
  try {
    const { slug: rawSlug, lesSlug } = await params;

    // Resolve slug to canonical version (supports aliases)
    const slug = resolveSlug(rawSlug);
    const body = await request.json();
    const { userId, sectieId, lesId, cursusId, status, quizScore, quizAntwoorden, reflectieAntwoord, opdrachtVoltooide, actieplanVoltooide } = body;

    console.log(`💾 Updating progress for user ${userId}, section ${sectieId}`);

    // Upsert sectie progress
    const result = await sql`
      INSERT INTO user_sectie_progress (
        user_id,
        sectie_id,
        les_id,
        cursus_id,
        status,
        is_completed,
        completed_at,
        quiz_score,
        quiz_antwoorden,
        reflectie_antwoord,
        opdracht_voltooide_taken,
        actieplan_voltooide_acties,
        updated_at
      ) VALUES (
        ${userId},
        ${sectieId},
        ${lesId},
        ${cursusId},
        ${status || 'bezig'},
        ${status === 'completed'},
        ${status === 'completed' ? new Date().toISOString() : null},
        ${quizScore || null},
        ${quizAntwoorden ? JSON.stringify(quizAntwoorden) : null}::jsonb,
        ${reflectieAntwoord || null},
        ${opdrachtVoltooide ? JSON.stringify(opdrachtVoltooide) : null}::jsonb,
        ${actieplanVoltooide ? JSON.stringify(actieplanVoltooide) : null}::jsonb,
        NOW()
      )
      ON CONFLICT (user_id, sectie_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        is_completed = EXCLUDED.is_completed,
        completed_at = EXCLUDED.completed_at,
        quiz_score = COALESCE(EXCLUDED.quiz_score, user_sectie_progress.quiz_score),
        quiz_antwoorden = COALESCE(EXCLUDED.quiz_antwoorden, user_sectie_progress.quiz_antwoorden),
        reflectie_antwoord = COALESCE(EXCLUDED.reflectie_antwoord, user_sectie_progress.reflectie_antwoord),
        opdracht_voltooide_taken = COALESCE(EXCLUDED.opdracht_voltooide_taken, user_sectie_progress.opdracht_voltooide_taken),
        actieplan_voltooide_acties = COALESCE(EXCLUDED.actieplan_voltooide_acties, user_sectie_progress.actieplan_voltooide_acties),
        updated_at = NOW()
      RETURNING *
    `;

    console.log(`✅ Progress saved for sectie ${sectieId}`);

    return NextResponse.json({
      success: true,
      message: 'Voortgang opgeslagen',
      progress: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress', details: error.message },
      { status: 500 }
    );
  }
}
