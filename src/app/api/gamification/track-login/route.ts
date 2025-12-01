import { NextRequest, NextResponse } from 'next/server';
import { trackDailyLogin } from '@/lib/gamification/streak-tracker';

/**
 * POST /api/gamification/track-login
 * Track daily login and award streak points
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Track the daily login and get streak data
    const streakData = await trackDailyLogin(userId);

    return NextResponse.json({
      success: true,
      message: streakData.currentStreak === 1
        ? '🎉 First login! Keep coming back to build your streak!'
        : `🔥 ${streakData.currentStreak} day streak! ${streakData.bonusMultiplier}x points!`,
      streakData: {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        pointsEarned: streakData.pointsEarned,
        bonusMultiplier: streakData.bonusMultiplier,
        todayCompleted: streakData.todayCompleted,
        streakActive: streakData.streakActive
      }
    });

  } catch (error) {
    console.error('Error tracking login:', error);
    return NextResponse.json(
      { error: 'Failed to track login', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
