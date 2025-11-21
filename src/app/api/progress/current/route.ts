import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeekProgress, getWeeklyInsights, getUserBadges } from '@/lib/progress-tracker';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current week progress
    const progress = await getCurrentWeekProgress(user.id);
    const insights = await getWeeklyInsights(user.id);
    const badges = await getUserBadges(user.id);

    return NextResponse.json({
      progress,
      insights,
      badges,
      weekStart: progress?.weekStart || new Date()
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({
      error: 'Failed to fetch progress data'
    }, { status: 500 });
  }
}