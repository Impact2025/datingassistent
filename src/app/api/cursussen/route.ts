import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import { verifyToken, cookieConfig } from '@/lib/jwt-config';
import { logger } from '@/lib/logger';
import { getCursusAccess } from '@/lib/cursus-access';

/**
 * GET /api/cursussen
 * Haal alle gepubliceerde cursussen op met toegangscontrole
 */
export async function GET(request: NextRequest) {
  try {
    logger.log('🚀 Fetching cursussen...');

    let userId: number | null = null;
    let userSubscription: string | null = null;
    let enrolledProgramSlugs: string[] = [];

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(cookieConfig.name)?.value;

      if (token) {
        const user = await verifyToken(token);
        if (user) {
          userId = user.id;

          const userResult = await sql`
            SELECT subscription_type FROM users WHERE id = ${userId}
          `;
          if (userResult.rows.length > 0) {
            userSubscription = userResult.rows[0].subscription_type;
          }

          // Check active program enrollments (kickstart / transformatie / vip)
          const enrollmentsResult = await sql`
            SELECT p.slug
            FROM program_enrollments pe
            JOIN programs p ON p.id = pe.program_id
            WHERE pe.user_id = ${userId} AND pe.status = 'active'
          `;
          enrolledProgramSlugs = enrollmentsResult.rows.map((r: any) => r.slug);
        }
      }
    } catch (authError) {
      logger.log('No authenticated user for cursussen request');
    }

    const result = await sql`
      SELECT
        c.*,
        COUNT(DISTINCT cl.id) as totaal_lessen
      FROM cursussen c
      LEFT JOIN cursus_lessen cl ON cl.cursus_id = c.id AND cl.status = 'published'
      WHERE c.status = 'published'
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `;

    logger.log(`✅ Found ${result.rows.length} cursussen`);

    // Fetch real lesson-completion counts per cursus for this user
    const progressByCursus: Record<number, number> = {};
    if (userId) {
      try {
        const progressResult = await sql`
          WITH lesson_totals AS (
            SELECT les_id, COUNT(*) AS total_secties
            FROM cursus_secties
            GROUP BY les_id
          ),
          user_completed AS (
            SELECT les_id, COUNT(*) AS completed_secties
            FROM user_sectie_progress
            WHERE user_id = ${userId} AND is_completed = true
            GROUP BY les_id
          )
          SELECT
            cl.cursus_id,
            COUNT(DISTINCT CASE
              WHEN COALESCE(uc.completed_secties, 0) = lt.total_secties AND lt.total_secties > 0
              THEN cl.id
            END)::int AS voltooide_lessen
          FROM cursus_lessen cl
          LEFT JOIN lesson_totals lt ON lt.les_id = cl.id
          LEFT JOIN user_completed uc ON uc.les_id = cl.id
          WHERE cl.status = 'published'
          GROUP BY cl.cursus_id
        `;
        for (const row of progressResult.rows) {
          progressByCursus[row.cursus_id] = parseInt(row.voltooide_lessen) || 0;
        }
      } catch {
        logger.log('Could not fetch lesson progress for gallery');
      }
    }

    const cursussen = result.rows.map((cursus: any) => {
      const hasAccess = getCursusAccess(cursus.cursus_type, userSubscription, enrolledProgramSlugs);
      const totaalLessen = parseInt(cursus.totaal_lessen) || 0;
      const voltooieLessen = progressByCursus[cursus.id] ?? 0;
      const percentage = totaalLessen > 0 ? Math.round((voltooieLessen / totaalLessen) * 100) : 0;

      return {
        ...cursus,
        doelen: cursus.doelen || [],
        gekoppelde_tools: cursus.gekoppelde_tools || [],
        hasAccess,
        user_progress: {
          voltooide_lessen: voltooieLessen,
          totaal_lessen: totaalLessen,
          percentage
        }
      };
    });

    return NextResponse.json({ cursussen });
  } catch (error: any) {
    console.error('Error fetching cursussen:', error);
    return NextResponse.json({ error: 'Failed to fetch cursussen', details: error.message }, { status: 500 });
  }
}
