import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/cursussen/[slug]
 * Haal volledige cursus op inclusief lessen, secties en quiz vragen
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession();
    const userId = session?.user?.id;

    // 1. Haal cursus metadata op
    const cursusResult = await sql`
      SELECT * FROM cursussen WHERE slug = ${slug} AND status = 'published' LIMIT 1
    `;

    if (cursusResult.length === 0) {
      return NextResponse.json({ error: 'Cursus niet gevonden' }, { status: 404 });
    }

    const cursus = cursusResult[0];

    // 2. Haal alle lessen op
    const lessenResult = await sql`
      SELECT * FROM cursus_lessen
      WHERE cursus_id = ${cursus.id} AND status = 'published'
      ORDER BY volgorde ASC
    `;

    // 3. Voor elk les, haal secties en quiz vragen op
    const lessen = await Promise.all(
      lessenResult.map(async (les: any) => {
        // Haal secties op
        const sectiesResult = await sql`
          SELECT * FROM cursus_secties
          WHERE les_id = ${les.id}
          ORDER BY volgorde ASC
        `;

        // Voor elke sectie van type 'quiz', haal quiz vragen op
        const sectiesMetQuizVragen = await Promise.all(
          sectiesResult.map(async (sectie: any) => {
            if (sectie.sectie_type === 'quiz') {
              const quizVragenResult = await sql`
                SELECT * FROM cursus_quiz_vragen
                WHERE sectie_id = ${sectie.id}
                ORDER BY volgorde ASC
              `;
              return {
                ...sectie,
                quiz_vragen: quizVragenResult
              };
            }
            return sectie;
          })
        );

        // Als user ingelogd is, haal voortgang op
        let voortgang = null;
        if (userId) {
          // Haal alle sectie progress op voor deze les
          const sectieProgressResult = await sql`
            SELECT * FROM user_sectie_progress
            WHERE user_id = ${userId}
              AND les_id = ${les.id}
          `;

          // Bereken les status op basis van voltooide secties
          const voltooideSecties = sectieProgressResult.filter((p: any) => p.is_completed).map((p: any) => p.sectie_id);
          const totaalSecties = sectiesMetQuizVragen.length;
          const alleSectiesTotalVoltooide = voltooideSecties.length === totaalSecties && totaalSecties > 0;

          let lesStatus = 'niet-gestart';
          if (sectieProgressResult.length > 0) {
            lesStatus = alleSectiesTotalVoltooide ? 'afgerond' : 'bezig';
          }

          voortgang = {
            status: lesStatus,
            voltooide_secties: voltooideSecties,
            totaal_secties: totaalSecties
          };
        }

        return {
          ...les,
          secties: sectiesMetQuizVragen,
          user_progress: voortgang
        };
      })
    );

    // 4. Bereken overall voortgang
    let userProgress = null;
    if (userId) {
      const voltooideLessen = lessen.filter(
        (les: any) => les.user_progress?.status === 'afgerond'
      ).length;
      const totaalLessen = lessen.length;

      userProgress = {
        voltooide_lessen: voltooideLessen,
        totaal_lessen: totaalLessen,
        percentage: totaalLessen > 0 ? Math.round((voltooideLessen / totaalLessen) * 100) : 0,
        laatste_les_slug: lessen.find((les: any) => les.user_progress?.status === 'bezig')?.slug || null
      };
    }

    return NextResponse.json({
      cursus: {
        ...cursus,
        lessen,
        user_progress: userProgress
      }
    });
  } catch (error: any) {
    console.error('Error fetching cursus:', error);
    return NextResponse.json({ error: 'Failed to fetch cursus', details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/cursussen/[slug]/voortgang
 * Update voortgang voor een les
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { les_slug, status, completed_exercises, total_exercises } = body;

    const userId = session.user.id;

    // Bereken completion percentage
    const completionPercentage = total_exercises > 0
      ? Math.round((completed_exercises / total_exercises) * 100)
      : 0;

    // Upsert voortgang
    const result = await sql`
      INSERT INTO cursus_progress (
        user_id,
        module_slug,
        les_slug,
        completed_exercises,
        total_exercises,
        completion_percentage,
        status,
        started_at,
        completed_at,
        updated_at
      ) VALUES (
        ${userId},
        ${slug},
        ${les_slug},
        ${completed_exercises || 0},
        ${total_exercises || 0},
        ${completionPercentage},
        ${status || 'bezig'},
        NOW(),
        ${status === 'afgerond' ? sql`NOW()` : null},
        NOW()
      )
      ON CONFLICT (user_id, module_slug, les_slug)
      DO UPDATE SET
        completed_exercises = EXCLUDED.completed_exercises,
        total_exercises = EXCLUDED.total_exercises,
        completion_percentage = EXCLUDED.completion_percentage,
        status = EXCLUDED.status,
        completed_at = CASE
          WHEN EXCLUDED.status = 'afgerond' AND cursus_progress.status != 'afgerond'
          THEN NOW()
          ELSE cursus_progress.completed_at
        END,
        updated_at = NOW()
      RETURNING *
    `;

    // Update Iris context (optioneel)
    if (status === 'afgerond') {
      await sql`
        UPDATE iris_user_context
        SET
          huidige_cursus_slug = ${slug},
          huidige_les_slug = ${les_slug},
          laatste_activiteit = NOW(),
          updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }

    return NextResponse.json({ success: true, voortgang: result[0] });
  } catch (error: any) {
    console.error('Error updating voortgang:', error);
    return NextResponse.json({ error: 'Failed to update voortgang', details: error.message }, { status: 500 });
  }
}
