import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { resolveSlug } from '@/lib/cursus-slug-utils';

/**
 * GET /api/cursussen/[slug]
 * Haal volledige cursus op inclusief lessen, secties en quiz vragen
 *
 * ✨ WERELDKLASSE FEATURE: Ondersteunt slug aliases voor backwards compatibility
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;

    // Resolve slug to canonical version (supports aliases)
    const slug = resolveSlug(rawSlug);

    if (rawSlug !== slug) {
      console.log(`🔄 Slug alias resolved: ${rawSlug} -> ${slug}`);
    }

    // Try to get user from JWT token
    let userId: number | null = null;
    let userSubscription: string | null = null;
    let purchasedCursusIds: number[] = [];

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;

      if (token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
        const { payload } = await jwtVerify(token, secret);
        userId = payload.userId as number;

        // Get user's subscription type
        const userResult = await sql`
          SELECT subscription_type FROM users WHERE id = ${userId}
        `;
        if (userResult.rows.length > 0) {
          userSubscription = userResult.rows[0].subscription_type;
        }

        // Get user's purchased courses (via payment_transactions)
        const purchasedResult = await sql`
          SELECT DISTINCT c.id
          FROM cursussen c
          JOIN payment_transactions pt ON pt.cursus_id = c.id
          WHERE pt.user_id = ${userId}
            AND pt.status = 'completed'
        `;
        purchasedCursusIds = purchasedResult.rows.map((r: any) => r.id);
      }
    } catch (authError) {
      console.log('No authenticated user for cursus detail request');
    }

    // 1. Haal cursus metadata op
    const cursusResult = await sql`
      SELECT * FROM cursussen WHERE slug = ${slug} AND status = 'published' LIMIT 1
    `;

    if (cursusResult.rows.length === 0) {
      return NextResponse.json({ error: 'Cursus niet gevonden' }, { status: 404 });
    }

    const cursus = cursusResult.rows[0];

    // 2. Haal alle lessen op
    const lessenResult = await sql`
      SELECT * FROM cursus_lessen
      WHERE cursus_id = ${cursus.id} AND status = 'published'
      ORDER BY volgorde ASC
    `;

    // 3. Voor elk les, haal secties en quiz vragen op
    const lessen = await Promise.all(
      lessenResult.rows.map(async (les: any) => {
        // Haal secties op
        const sectiesResult = await sql`
          SELECT * FROM cursus_secties
          WHERE les_id = ${les.id}
          ORDER BY volgorde ASC
        `;

        // Voor elke sectie van type 'quiz', haal quiz vragen op
        const sectiesMetQuizVragen = await Promise.all(
          sectiesResult.rows.map(async (sectie: any) => {
            // Parse inhoud if it's a string (JSONB sometimes returns as string)
            let inhoud = sectie.inhoud;
            if (typeof inhoud === 'string') {
              try {
                inhoud = JSON.parse(inhoud);
              } catch (e) {
                console.error(`Failed to parse inhoud for sectie ${sectie.id}:`, e);
                inhoud = {};
              }
            }

            if (sectie.sectie_type === 'quiz') {
              const quizVragenResult = await sql`
                SELECT * FROM cursus_quiz_vragen
                WHERE sectie_id = ${sectie.id}
                ORDER BY volgorde ASC
              `;
              return {
                ...sectie,
                inhoud: inhoud || {},
                quiz_vragen: quizVragenResult.rows
              };
            }
            return {
              ...sectie,
              inhoud: inhoud || {}
            };
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
          const voltooideSecties = sectieProgressResult.rows.filter((p: any) => p.is_completed).map((p: any) => p.sectie_id);
          const totaalSecties = sectiesMetQuizVragen.length;
          const alleSectiesTotalVoltooide = voltooideSecties.length === totaalSecties && totaalSecties > 0;

          let lesStatus = 'niet-gestart';
          if (sectieProgressResult.rows.length > 0) {
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

    // Determine access
    const isGratis = cursus.cursus_type === 'gratis';
    const isVip = userSubscription === 'vip' || userSubscription === 'expert' || userSubscription === 'groeier';
    const isPurchased = purchasedCursusIds.includes(cursus.id);
    const hasAccess = isGratis || isVip || isPurchased;

    return NextResponse.json({
      cursus: {
        ...cursus,
        lessen,
        user_progress: userProgress,
        hasAccess
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
    // Authenticate user
    let userId: number | null = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;

      if (token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
        const { payload } = await jwtVerify(token, secret);
        userId = payload.userId as number;
      }
    } catch (authError) {
      console.log('Auth error in POST cursussen:', authError);
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { les_slug, status, completed_exercises, total_exercises } = body;

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

    return NextResponse.json({ success: true, voortgang: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating voortgang:', error);
    return NextResponse.json({ error: 'Failed to update voortgang', details: error.message }, { status: 500 });
  }
}
