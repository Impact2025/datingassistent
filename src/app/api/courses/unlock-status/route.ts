import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getCourseUnlockStatus, getNextCourseUnlockDate, getUnlockedCourseCount } from '@/lib/course-unlock';

export const dynamic = 'force-dynamic';

/**
 * GET /api/courses/unlock-status
 *
 * Returns course unlock information for the current user
 * based on their subscription tier and start date
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    // Get unlock status for all courses
    const unlockStatus = await getCourseUnlockStatus(user.id);
    const unlockedCount = await getUnlockedCourseCount(user.id);
    const nextUnlockDate = await getNextCourseUnlockDate(user.id);

    return NextResponse.json({
      courses: unlockStatus,
      summary: {
        unlockedCount,
        totalCount: unlockStatus.length,
        nextUnlockDate: nextUnlockDate?.toISOString() ?? null
      }
    });

  } catch (error) {
    console.error('❌ Error fetching course unlock status:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized: Please login' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch course unlock status' },
      { status: 500 }
    );
  }
}
