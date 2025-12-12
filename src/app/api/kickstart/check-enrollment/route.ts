import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Check if user has Kickstart enrollment
 * This allows Kickstart users to access dashboard without having a user_profile record
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user - use verifyAuth which reads Bearer token from Authorization header
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 Checking Kickstart enrollment for user:', currentUser.id);

    // Check for Kickstart program enrollment AND day-zero status in parallel
    const [enrollments, dayZeroProgress] = await Promise.all([
      sql`
        SELECT pe.id, pe.status, pe.kickstart_onboarding_completed, p.name, p.slug
        FROM program_enrollments pe
        JOIN programs p ON p.id = pe.program_id
        WHERE pe.user_id = ${currentUser.id} AND p.slug = 'kickstart'
        LIMIT 1
      `,
      sql`
        SELECT completed FROM day_zero_progress
        WHERE user_id = ${currentUser.id}
        LIMIT 1
      `
    ]);

    const hasEnrollment = enrollments.length > 0;
    const hasOnboardingData = hasEnrollment && enrollments[0]?.kickstart_onboarding_completed === true;
    const dayZeroCompleted = dayZeroProgress.length > 0 && dayZeroProgress[0]?.completed === true;

    console.log('✅ Kickstart enrollment check:', {
      userId: currentUser.id,
      hasEnrollment,
      hasOnboardingData,
      dayZeroCompleted,
      onboardingCompleted: enrollments[0]?.kickstart_onboarding_completed,
      enrollment: enrollments[0] || null
    });

    return NextResponse.json({
      hasEnrollment,
      hasOnboardingData,
      dayZeroCompleted,
      enrollment: hasEnrollment ? enrollments[0] : null
    });

  } catch (error) {
    console.error('❌ Error checking Kickstart enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error', hasEnrollment: false },
      { status: 500 }
    );
  }
}
