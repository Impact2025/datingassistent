import { NextRequest, NextResponse } from 'next/server';
import { checkAndUnlockAchievements } from '@/lib/achievements/achievement-tracker';
import { verifyAuth } from '@/lib/auth';

/**
 * POST /api/achievements/check
 * Check for newly unlocked achievements for the current user
 *
 * This endpoint is called after significant user actions (lesson completion, quiz passed, etc.)
 * to detect and return any newly earned achievements that can be displayed via toast notification
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check for new achievements
    const newAchievements = await checkAndUnlockAchievements(user.id);

    return NextResponse.json({
      success: true,
      achievements: newAchievements,
      count: newAchievements.length
    });

  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
