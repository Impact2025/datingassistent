import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/enrollment-status
 *
 * CONSOLIDATED ENROLLMENT CHECK - World-class optimization
 * Combines Kickstart, Transformatie, and VIP enrollment checks into ONE API call
 * Reduces dashboard load time from 10+ API calls to 1
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({
        authenticated: false,
        kickstart: null,
        transformatie: null,
        vip: null,
      }, {
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    }

    // Execute ALL enrollment checks in parallel - massive performance boost
    const [
      kickstartResult,
      transformatieResult,
      vipResult,
      dayZeroResult,
      transformatieOnboardingResult,
    ] = await Promise.all([
      // Kickstart enrollment
      sql`
        SELECT
          pe.id,
          pe.status,
          pe.enrolled_at,
          pe.kickstart_onboarding_completed,
          p.name as program_name,
          p.slug as program_slug
        FROM program_enrollments pe
        JOIN programs p ON p.id = pe.program_id
        WHERE pe.user_id = ${user.id}
        AND p.slug = 'kickstart'
        AND pe.status = 'active'
        LIMIT 1
      `,
      // Transformatie enrollment
      sql`
        SELECT
          pe.id,
          pe.status,
          pe.enrolled_at,
          pe.expires_at,
          p.id as program_id,
          p.name as program_name,
          p.slug as program_slug
        FROM program_enrollments pe
        JOIN programs p ON p.id = pe.program_id
        WHERE pe.user_id = ${user.id}
        AND p.slug = 'transformatie'
        AND pe.status = 'active'
        LIMIT 1
      `,
      // VIP enrollment (includes Transformatie)
      sql`
        SELECT
          pe.id,
          pe.status,
          pe.enrolled_at,
          p.name as program_name,
          p.slug as program_slug
        FROM program_enrollments pe
        JOIN programs p ON p.id = pe.program_id
        WHERE pe.user_id = ${user.id}
        AND p.slug IN ('vip', 'vip-coaching')
        AND pe.status = 'active'
        LIMIT 1
      `,
      // Day zero progress for Kickstart
      sql`
        SELECT completed FROM day_zero_progress
        WHERE user_id = ${user.id}
        LIMIT 1
      `,
      // Transformatie onboarding check
      sql`
        SELECT data, completed_at
        FROM transformatie_onboarding
        WHERE user_id = ${user.id}
        LIMIT 1
      `.catch(() => ({ rows: [] })), // Table might not exist
    ]);

    // Process Kickstart enrollment
    const kickstartEnrollment = kickstartResult.rows[0];
    const hasKickstart = kickstartResult.rows.length > 0;
    const kickstartOnboardingCompleted = kickstartEnrollment?.kickstart_onboarding_completed === true;
    const dayZeroCompleted = dayZeroResult.rows.length > 0 && dayZeroResult.rows[0]?.completed === true;

    // Process Transformatie enrollment
    const transformatieEnrollment = transformatieResult.rows[0];
    const hasTransformatie = transformatieResult.rows.length > 0;
    const hasVip = vipResult.rows.length > 0;
    const transformatieOnboarding = transformatieOnboardingResult.rows[0];
    const transformatieOnboardingCompleted = transformatieOnboarding?.completed_at != null;

    // Get Transformatie progress if enrolled
    let transformatieProgress = null;
    if (hasTransformatie || hasVip) {
      const progressResult = await sql`
        SELECT
          COUNT(DISTINCT tl.id)::int as total_lessons,
          COUNT(CASE WHEN tlp.status = 'completed' THEN 1 END)::int as completed_lessons,
          MAX(tlp.updated_at) as last_activity
        FROM transformatie_lessons tl
        JOIN transformatie_modules tm ON tl.module_id = tm.id
        LEFT JOIN transformatie_lesson_progress tlp ON tl.id = tlp.lesson_id AND tlp.user_id = ${user.id}
        WHERE tl.is_published = true
        AND tm.is_published = true
      `;

      const progress = progressResult.rows[0];
      transformatieProgress = {
        total: progress.total_lessons,
        completed: progress.completed_lessons,
        percentage: progress.total_lessons > 0
          ? Math.round((progress.completed_lessons / progress.total_lessons) * 100)
          : 0,
        lastActivity: progress.last_activity,
      };
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Consolidated enrollment check completed in ${duration}ms for user ${user.id}`);

    return NextResponse.json({
      authenticated: true,
      userId: user.id,

      // Kickstart enrollment
      kickstart: hasKickstart ? {
        isEnrolled: true,
        enrollment: {
          id: kickstartEnrollment.id,
          status: kickstartEnrollment.status,
          enrolledAt: kickstartEnrollment.enrolled_at,
        },
        onboardingCompleted: kickstartOnboardingCompleted,
        dayZeroCompleted,
        needsOnboarding: !kickstartOnboardingCompleted,
        needsDayZero: kickstartOnboardingCompleted && !dayZeroCompleted,
      } : {
        isEnrolled: false,
        onboardingCompleted: false,
        dayZeroCompleted: false,
      },

      // Transformatie enrollment (including VIP access)
      transformatie: (hasTransformatie || hasVip) ? {
        isEnrolled: true,
        via: hasVip ? 'vip' : 'direct',
        enrollment: {
          id: (transformatieEnrollment || vipResult.rows[0]).id,
          status: (transformatieEnrollment || vipResult.rows[0]).status,
          enrolledAt: (transformatieEnrollment || vipResult.rows[0]).enrolled_at,
          expiresAt: transformatieEnrollment?.expires_at,
        },
        onboardingCompleted: transformatieOnboardingCompleted,
        needsOnboarding: !transformatieOnboardingCompleted,
        progress: transformatieProgress,
      } : {
        isEnrolled: false,
        onboardingCompleted: false,
      },

      // VIP status
      vip: hasVip ? {
        isEnrolled: true,
        enrollment: {
          id: vipResult.rows[0].id,
          status: vipResult.rows[0].status,
        },
      } : {
        isEnrolled: false,
      },

      // Meta
      _meta: {
        duration,
        timestamp: new Date().toISOString(),
      },
    }, {
      headers: {
        // Cache for 30 seconds on client, stale-while-revalidate for 60s
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    console.error('❌ Enrollment status error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        error: 'Er is een fout opgetreden',
        kickstart: { isEnrolled: false },
        transformatie: { isEnrolled: false },
        vip: { isEnrolled: false },
      },
      { status: 500 }
    );
  }
}
