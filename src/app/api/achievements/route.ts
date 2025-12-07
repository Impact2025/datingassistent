import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import {
  ACHIEVEMENTS,
  getAchievementBySlug,
  type Achievement,
  type UserAchievement,
  type AchievementProgress,
  type AchievementStats,
} from '@/types/achievement.types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * GET /api/achievements
 * Get all achievements with user's progress
 */
export async function GET(request: NextRequest) {
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

    // Get user's unlocked achievements
    const unlockedResult = await pool.query<{
      achievement_slug: string;
      unlocked_at: Date;
      progress: number;
      notified: boolean;
    }>(
      'SELECT achievement_slug, unlocked_at, progress, notified FROM user_achievements WHERE user_id = $1',
      [userId]
    );

    const unlockedMap = new Map(
      unlockedResult.rows.map((row) => [row.achievement_slug, row])
    );

    // Get current progress data for incremental achievements
    const progressData = await getUserProgressData(userId);

    // Build achievement progress list
    const achievements: AchievementProgress[] = ACHIEVEMENTS.map((achievement) => {
      const unlocked = unlockedMap.get(achievement.slug);
      const current = calculateCurrentProgress(achievement, progressData);
      const target = achievement.requirement.target;

      return {
        achievement,
        unlocked: !!unlocked,
        unlocked_at: unlocked?.unlocked_at,
        current_progress: current,
        target_progress: target,
        percentage: Math.min(100, Math.round((current / target) * 100)),
      };
    });

    // Calculate stats
    const stats: AchievementStats = {
      total_unlocked: unlockedResult.rows.length,
      total_points: achievements
        .filter((a) => a.unlocked)
        .reduce((sum, a) => sum + a.achievement.points, 0),
      total_available: ACHIEVEMENTS.length,
      by_category: {
        milestone: achievements.filter(
          (a) => a.achievement.category === 'milestone' && a.unlocked
        ).length,
        streak: achievements.filter(
          (a) => a.achievement.category === 'streak' && a.unlocked
        ).length,
        engagement: achievements.filter(
          (a) => a.achievement.category === 'engagement' && a.unlocked
        ).length,
        mastery: achievements.filter(
          (a) => a.achievement.category === 'mastery' && a.unlocked
        ).length,
      },
      recent_unlocks: unlockedResult.rows
        .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
        .slice(0, 5)
        .map((row) => ({
          id: 0, // Not needed for recent list
          user_id: userId,
          achievement_slug: row.achievement_slug,
          unlocked_at: row.unlocked_at,
          progress: row.progress,
          notified: row.notified,
        })),
    };

    return NextResponse.json({
      success: true,
      achievements,
      stats,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
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
