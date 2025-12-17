import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/transformatie/check-enrollment
 * Check if current user is enrolled in Transformatie program
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({
        isEnrolled: false,
        reason: 'not_logged_in',
      });
    }

    // Get Transformatie program
    const programResult = await sql`
      SELECT id, slug, name
      FROM programs
      WHERE slug = 'transformatie'
      LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      return NextResponse.json({
        isEnrolled: false,
        reason: 'program_not_found',
      });
    }

    const program = programResult.rows[0];

    // Check for active enrollment
    const enrollmentResult = await sql`
      SELECT
        pe.id,
        pe.status,
        pe.enrolled_at,
        pe.expires_at
      FROM program_enrollments pe
      WHERE pe.user_id = ${user.id}
      AND pe.program_id = ${program.id}
      AND pe.status = 'active'
      LIMIT 1
    `;

    if (enrollmentResult.rows.length === 0) {
      // Check if user has VIP enrollment (which includes Transformatie)
      const vipCheck = await sql`
        SELECT pe.id, pe.status
        FROM program_enrollments pe
        JOIN programs p ON pe.program_id = p.id
        WHERE pe.user_id = ${user.id}
        AND p.slug IN ('vip', 'vip-coaching')
        AND pe.status = 'active'
        LIMIT 1
      `;

      if (vipCheck.rows.length > 0) {
        return NextResponse.json({
          isEnrolled: true,
          enrollment: {
            id: vipCheck.rows[0].id,
            status: vipCheck.rows[0].status,
            via: 'vip',
          },
          program: {
            id: program.id,
            slug: program.slug,
            name: program.name,
          },
          tier: 'vip',
        });
      }

      return NextResponse.json({
        isEnrolled: false,
        reason: 'not_enrolled',
        program: {
          id: program.id,
          slug: program.slug,
          name: program.name,
        },
      });
    }

    const enrollment = enrollmentResult.rows[0];

    // Check if onboarding is completed (using metadata field or separate check)
    let hasOnboardingData = false;
    let onboardingData = null;

    try {
      const onboardingCheck = await sql`
        SELECT data, completed_at
        FROM transformatie_onboarding
        WHERE user_id = ${user.id}
        LIMIT 1
      `;

      if (onboardingCheck.rows.length > 0 && onboardingCheck.rows[0].completed_at) {
        hasOnboardingData = true;
        onboardingData = onboardingCheck.rows[0].data;
      }
    } catch {
      // Table might not exist yet, that's ok
      console.log('Transformatie onboarding table not found or empty');
    }

    // Check if enrollment is expired
    if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) {
      return NextResponse.json({
        isEnrolled: false,
        reason: 'enrollment_expired',
        enrollment: {
          id: enrollment.id,
          expired_at: enrollment.expires_at,
        },
      });
    }

    // Get user's progress summary
    const progressResult = await sql`
      SELECT
        COUNT(DISTINCT tl.id)::int as total_lessons,
        COUNT(CASE WHEN tlp.status = 'completed' THEN 1 END)::int as completed_lessons,
        MAX(tlp.updated_at) as last_activity
      FROM transformatie_lessons tl
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      LEFT JOIN transformatie_lesson_progress tlp ON tl.id = tlp.lesson_id AND tlp.user_id = ${user.id}
      WHERE tm.program_id = ${program.id}
      AND tl.is_published = true
      AND tm.is_published = true
    `;

    const progress = progressResult.rows[0];

    return NextResponse.json({
      isEnrolled: true,
      hasOnboardingData,
      onboardingData,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolled_at: enrollment.enrolled_at,
        expires_at: enrollment.expires_at,
      },
      program: {
        id: program.id,
        slug: program.slug,
        name: program.name,
      },
      tier: 'transformatie',
      progress: {
        total: progress.total_lessons,
        completed: progress.completed_lessons,
        percentage: progress.total_lessons > 0
          ? Math.round((progress.completed_lessons / progress.total_lessons) * 100)
          : 0,
        lastActivity: progress.last_activity,
      },
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    return NextResponse.json(
      {
        isEnrolled: false,
        error: 'Er is een fout opgetreden',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
