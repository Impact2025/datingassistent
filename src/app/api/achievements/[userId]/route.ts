import { NextRequest, NextResponse } from 'next/server';
import { getUserAchievements, getAchievementProgress } from '@/lib/achievements/achievement-tracker';

/**
 * GET /api/achievements/[userId]
 * Haal alle achievements op voor een user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: userIdStr } = await params;
    const userId = parseInt(userIdStr);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const [achievements, progress] = await Promise.all([
      getUserAchievements(userId),
      getAchievementProgress(userId)
    ]);

    return NextResponse.json({
      achievements,
      progress,
      total_points: achievements.reduce((sum, a) => sum + (a.points || 0), 0)
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
