import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Check if user has Kickstart enrollment
 * This allows Kickstart users to access dashboard without having a user_profile record
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 Checking Kickstart enrollment for user:', currentUser.id);

    // Check for Kickstart program enrollment
    const enrollments = await sql`
      SELECT pe.id, pe.status, pe.kickstart_onboarding_completed, p.name, p.slug
      FROM program_enrollments pe
      JOIN programs p ON p.id = pe.program_id
      WHERE pe.user_id = ${currentUser.id} AND p.slug = 'kickstart'
      LIMIT 1
    `;

    const hasEnrollment = enrollments.length > 0;

    console.log('✅ Kickstart enrollment check:', {
      userId: currentUser.id,
      hasEnrollment,
      enrollment: enrollments[0] || null
    });

    return NextResponse.json({
      hasEnrollment,
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
