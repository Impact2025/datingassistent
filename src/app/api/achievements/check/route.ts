import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import {
  ACHIEVEMENTS,
  type Achievement,
} from '@/types/achievement.types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * POST /api/achievements/check
 * Check and unlock eligible achievements for the current user
 * Returns newly unlocked achievements
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = await getUserIdFromAuth(authHeader);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Get current progress data
    const progressData = await getUserProgressData(userId);

    // Get already unlocked achievements
    const unlockedResult = await pool.query<{ achievement_slug: string }>(
      'SELECT achievement_slug FROM user_achievements WHERE user_id = $1',
      [userId]
    );
    const unlockedSlugs = new Set(unlockedResult.rows.map((r) => r.achievement_slug));

    // Check all achievements
    const newlyUnlocked: Achievement[] = [];
    let totalPoints = 0;

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (unlockedSlugs.has(achievement.slug)) {
        continue;
      }

      // Calculate current progress
      const currentProgress = calculateCurrentProgress(achievement, progressData);

      // Check if requirement is met
      if (currentProgress >= achievement.requirement.target) {
        // Unlock the achievement
        const result = await pool.query(
          `SELECT * FROM check_and_unlock_achievement($1, $2, $3)`,
          [userId, achievement.slug, currentProgress]
        );

        const unlockResult = result.rows[0];
        if (unlockResult.newly_unlocked) {
          newlyUnlocked.push(achievement);
          totalPoints += achievement.points;
        }
      }
    }

    return NextResponse.json({
      success: true,
      newly_unlocked: newlyUnlocked,
      total_points: totalPoints,
      checked_count: ACHIEVEMENTS.length,
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get user progress data for achievement calculations
 */
async function getUserProgressData(userId: number) {
  const [streakResult, dayProgressResult, reflectionResult] = await Promise.all([
    // Streak data
    pool.query<{ current_streak: number; longest_streak: number; total_days_completed: number }>(
      `SELECT current_streak, longest_streak, total_days_completed
       FROM user_streaks
       WHERE user_id = $1 AND program_slug = 'kickstart'`,
      [userId]
    ),

    // Day completion data
    pool.query<{ total_days: number; completed_days: number; weeks_completed: number }>(
      `SELECT
        COUNT(DISTINCT day_id) as total_days,
        COUNT(DISTINCT CASE WHEN status = 'completed' THEN day_id END) as completed_days,
        COUNT(DISTINCT CASE WHEN status = 'completed' THEN week_number END) as weeks_completed
       FROM kickstart_progress
       WHERE user_id = $1`,
      [userId]
    ),

    // Reflection count
    pool.query<{ reflection_count: number }>(
      `SELECT COUNT(*) as reflection_count
       FROM kickstart_reflections
       WHERE user_id = $1`,
      [userId]
    ),
  ]);

  return {
    currentStreak: streakResult.rows[0]?.current_streak || 0,
    longestStreak: streakResult.rows[0]?.longest_streak || 0,
    totalDaysCompleted: streakResult.rows[0]?.total_days_completed || 0,
    completedDays: dayProgressResult.rows[0]?.completed_days || 0,
    weeksCompleted: dayProgressResult.rows[0]?.weeks_completed || 0,
    reflectionCount: reflectionResult.rows[0]?.reflection_count || 0,
  };
}

/**
 * Helper: Calculate current progress for an achievement
 */
function calculateCurrentProgress(
  achievement: Achievement,
  progressData: ReturnType<typeof getUserProgressData> extends Promise<infer T> ? T : never
): number {
  switch (achievement.requirement.type) {
    case 'day_complete':
      return progressData.completedDays;
    case 'streak':
      return progressData.currentStreak;
    case 'week_complete':
      return progressData.weeksCompleted;
    case 'reflection_count':
      return progressData.reflectionCount;
    case 'video_complete':
      return progressData.completedDays; // Videos are part of day completion
    case 'quiz_perfect':
      return 0; // TODO: Track perfect quiz scores
    default:
      return 0;
  }
}

/**
 * Helper: Extract user ID from authorization header
 */
async function getUserIdFromAuth(authHeader: string): Promise<number | null> {
  try {
    const token = authHeader.replace('Bearer ', '');

    const result = await pool.query<{ user_id: number }>(
      `SELECT user_id FROM user_sessions WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (result.rows.length > 0) {
      return result.rows[0].user_id;
    }

    return null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
}
