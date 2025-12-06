import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import {
  getRecommendationsForDay,
  getWeekRecommendation,
  getWeekForDay,
  getPostKickstartJourney,
  isWeekComplete,
  calculateDiscountedPrice,
  type CursusMapping,
  type WeekRecommendation,
  type PostKickstartJourney,
} from '@/lib/kickstart-cursus-mapping';

export const dynamic = 'force-dynamic';

interface EnrichedCursusRecommendation extends CursusMapping {
  cursusData?: {
    id: number;
    titel: string;
    beschrijving: string;
    prijs: number;
    discountedPrijs?: number;
    thumbnail_url?: string;
    duur_minuten?: number;
    totaal_lessen: number;
  };
  lesData?: {
    id: number;
    titel: string;
    beschrijving?: string;
    duur_minuten?: number;
  };
  userProgress?: {
    hasAccess: boolean;
    isCompleted: boolean;
    progressPercentage: number;
  };
}

interface RecommendationsResponse {
  success: boolean;
  dayRecommendations: EnrichedCursusRecommendation[];
  weekRecommendation: (WeekRecommendation & {
    enrichedCursussen: EnrichedCursusRecommendation[];
  }) | null;
  postKickstartJourney: (PostKickstartJourney & {
    enrichedRecommendations: EnrichedCursusRecommendation[];
  }) | null;
  userContext: {
    currentDay: number;
    currentWeek: 1 | 2 | 3;
    completedDays: number[];
    isWeekComplete: boolean;
    isKickstartComplete: boolean;
  };
}

/**
 * GET /api/kickstart/recommendations
 *
 * Haalt slimme cursus-aanbevelingen op gebaseerd op:
 * - Huidige dag in het Kickstart programma
 * - Voltooide weken
 * - User subscription type
 * - Bestaande cursus voortgang
 */
export async function GET(request: NextRequest): Promise<NextResponse<RecommendationsResponse | { error: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dayNumber = parseInt(searchParams.get('day') || '1', 10);
    const scenario = searchParams.get('scenario') as 'still_dating' | 'found_match' | 'in_relationship' | null;

    // 1. Haal user's Kickstart voortgang op
    const progressResult = await sql`
      SELECT
        pd.dag_nummer,
        udp.status
      FROM user_day_progress udp
      JOIN program_days pd ON pd.id = udp.day_id
      JOIN programs p ON p.id = udp.program_id AND p.slug = 'kickstart'
      WHERE udp.user_id = ${user.id}
    `;

    const completedDays = progressResult.rows
      .filter(r => r.status === 'completed')
      .map(r => r.dag_nummer);

    const currentWeek = getWeekForDay(dayNumber);
    const weekComplete = isWeekComplete(completedDays, currentWeek);
    const isKickstartComplete = completedDays.length >= 21;

    // 2. Haal dag-specifieke aanbevelingen
    const dayMappings = getRecommendationsForDay(dayNumber);

    // 3. Haal cursus data voor alle aanbevelingen
    const cursussSlugs = [...new Set(dayMappings.map(m => m.cursusSlug))];

    const cursussenData: Record<string, any> = {};
    if (cursussSlugs.length > 0) {
      const cursussenResult = await sql`
        SELECT
          c.id,
          c.slug,
          c.titel,
          c.beschrijving,
          c.prijs,
          c.thumbnail_url,
          c.duur_minuten,
          c.cursus_type,
          COUNT(DISTINCT cl.id) as totaal_lessen
        FROM cursussen c
        LEFT JOIN cursus_lessen cl ON cl.cursus_id = c.id AND cl.status = 'published'
        WHERE c.slug = ANY(${cursussSlugs})
        GROUP BY c.id
      `;

      for (const cursus of cursussenResult.rows) {
        cursussenData[cursus.slug] = cursus;
      }
    }

    // 4. Haal les data indien nodig
    const lesQueries = dayMappings.filter(m => m.lesSlug);
    const lessenData: Record<string, any> = {};

    for (const mapping of lesQueries) {
      if (mapping.lesSlug && cursussenData[mapping.cursusSlug]) {
        const lesResult = await sql`
          SELECT id, titel, beschrijving, duur_minuten
          FROM cursus_lessen
          WHERE cursus_id = ${cursussenData[mapping.cursusSlug].id}
            AND slug = ${mapping.lesSlug}
          LIMIT 1
        `;
        if (lesResult.rows[0]) {
          lessenData[`${mapping.cursusSlug}:${mapping.lesSlug}`] = lesResult.rows[0];
        }
      }
    }

    // 5. Haal user's cursus voortgang
    const progressQuery = await sql`
      SELECT
        c.slug as cursus_slug,
        COUNT(DISTINCT CASE WHEN up.status = 'afgerond' THEN up.les_slug END) as completed_lessons,
        COUNT(DISTINCT cl.slug) as total_lessons
      FROM cursussen c
      LEFT JOIN cursus_lessen cl ON cl.cursus_id = c.id
      LEFT JOIN cursus_progress up ON up.user_id = ${user.id} AND up.module_slug = c.slug
      WHERE c.slug = ANY(${cursussSlugs})
      GROUP BY c.slug
    `;

    const userCursusProgress: Record<string, { completed: number; total: number }> = {};
    for (const row of progressQuery.rows) {
      userCursusProgress[row.cursus_slug] = {
        completed: parseInt(row.completed_lessons) || 0,
        total: parseInt(row.total_lessons) || 0,
      };
    }

    // 6. Bepaal user access (subscription-based)
    const userSubscription = user.subscription_type || 'free';
    const hasFullAccess = ['vip', 'expert', 'groeier'].includes(userSubscription);

    // 7. Enrich dag aanbevelingen
    const enrichedDayRecommendations: EnrichedCursusRecommendation[] = dayMappings.map(mapping => {
      const cursus = cursussenData[mapping.cursusSlug];
      const les = lessenData[`${mapping.cursusSlug}:${mapping.lesSlug}`];
      const progress = userCursusProgress[mapping.cursusSlug];

      const hasAccess = !mapping.isPremium || hasFullAccess || cursus?.cursus_type === 'gratis';
      const isCompleted = progress && progress.total > 0 && progress.completed === progress.total;
      const progressPercentage = progress && progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : 0;

      return {
        ...mapping,
        cursusData: cursus ? {
          id: cursus.id,
          titel: cursus.titel,
          beschrijving: cursus.beschrijving,
          prijs: cursus.prijs,
          discountedPrijs: mapping.discount
            ? calculateDiscountedPrice(cursus.prijs, mapping.discount)
            : undefined,
          thumbnail_url: cursus.thumbnail_url,
          duur_minuten: cursus.duur_minuten,
          totaal_lessen: parseInt(cursus.totaal_lessen) || 0,
        } : undefined,
        lesData: les ? {
          id: les.id,
          titel: les.titel,
          beschrijving: les.beschrijving,
          duur_minuten: les.duur_minuten,
        } : undefined,
        userProgress: {
          hasAccess,
          isCompleted,
          progressPercentage,
        },
      };
    });

    // 8. Week recommendation indien week voltooid
    let weekRecommendation: (WeekRecommendation & { enrichedCursussen: EnrichedCursusRecommendation[] }) | null = null;

    if (weekComplete && dayNumber % 7 === 0) {
      const weekRec = getWeekRecommendation(currentWeek);
      if (weekRec) {
        const enrichedCursussen = await enrichMappings(
          weekRec.cursussen,
          user.id,
          hasFullAccess,
          cursussenData,
          userCursusProgress
        );

        weekRecommendation = {
          ...weekRec,
          enrichedCursussen,
        };
      }
    }

    // 9. Post-Kickstart journey indien voltooid
    let postKickstartJourney: (PostKickstartJourney & { enrichedRecommendations: EnrichedCursusRecommendation[] }) | null = null;

    if (isKickstartComplete && scenario) {
      const journey = getPostKickstartJourney(scenario);
      if (journey) {
        const enrichedRecommendations = await enrichMappings(
          journey.recommendations,
          user.id,
          hasFullAccess,
          cursussenData,
          userCursusProgress
        );

        postKickstartJourney = {
          ...journey,
          enrichedRecommendations,
        };
      }
    }

    return NextResponse.json({
      success: true,
      dayRecommendations: enrichedDayRecommendations,
      weekRecommendation,
      postKickstartJourney,
      userContext: {
        currentDay: dayNumber,
        currentWeek,
        completedDays,
        isWeekComplete: weekComplete,
        isKickstartComplete,
      },
    });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// Helper function om mappings te enrichen
async function enrichMappings(
  mappings: CursusMapping[],
  userId: number,
  hasFullAccess: boolean,
  existingCursusData: Record<string, any>,
  existingProgress: Record<string, { completed: number; total: number }>
): Promise<EnrichedCursusRecommendation[]> {
  // Fetch missing cursus data
  const missingSlugs = mappings
    .map(m => m.cursusSlug)
    .filter(slug => !existingCursusData[slug]);

  if (missingSlugs.length > 0) {
    const result = await sql`
      SELECT
        c.id, c.slug, c.titel, c.beschrijving, c.prijs,
        c.thumbnail_url, c.duur_minuten, c.cursus_type,
        COUNT(DISTINCT cl.id) as totaal_lessen
      FROM cursussen c
      LEFT JOIN cursus_lessen cl ON cl.cursus_id = c.id AND cl.status = 'published'
      WHERE c.slug = ANY(${missingSlugs})
      GROUP BY c.id
    `;

    for (const cursus of result.rows) {
      existingCursusData[cursus.slug] = cursus;
    }
  }

  return mappings.map(mapping => {
    const cursus = existingCursusData[mapping.cursusSlug];
    const progress = existingProgress[mapping.cursusSlug];

    const hasAccess = !mapping.isPremium || hasFullAccess || cursus?.cursus_type === 'gratis';
    const isCompleted = progress && progress.total > 0 && progress.completed === progress.total;
    const progressPercentage = progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

    return {
      ...mapping,
      cursusData: cursus ? {
        id: cursus.id,
        titel: cursus.titel,
        beschrijving: cursus.beschrijving,
        prijs: cursus.prijs,
        discountedPrijs: mapping.discount
          ? calculateDiscountedPrice(cursus.prijs, mapping.discount)
          : undefined,
        thumbnail_url: cursus.thumbnail_url,
        duur_minuten: cursus.duur_minuten,
        totaal_lessen: parseInt(cursus.totaal_lessen) || 0,
      } : undefined,
      userProgress: {
        hasAccess,
        isCompleted,
        progressPercentage,
      },
    };
  });
}
