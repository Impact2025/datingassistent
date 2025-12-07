import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { ACHIEVEMENTS, type Achievement } from '@/types/achievement.types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeCount: number;
  totalDaysCompleted: number;
}

/**
 * GET /api/kickstart/streak
 * Get user's current streak data
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth token (simplified - adjust based on your auth)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract user ID from token or session
    // For now, using a simple approach - replace with your actual auth
    const userId = await getUserIdFromAuth(authHeader);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Get or create streak data
    const result = await pool.query<{
      current_streak: number;
      longest_streak: number;
      last_activity_date: string | null;
      streak_freeze_count: number;
      total_days_completed: number;
    }>(
      `
      INSERT INTO user_streaks (user_id, program_slug, current_streak, longest_streak)
      VALUES ($1, 'kickstart', 0, 0)
      ON CONFLICT (user_id, program_slug) DO NOTHING;

      SELECT
        current_streak,
        longest_streak,
        last_activity_date,
        streak_freeze_count,
        total_days_completed
      FROM user_streaks
      WHERE user_id = $1 AND program_slug = 'kickstart';
      `,
      [userId]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { success: false, error: 'Failed to get streak data' },
        { status: 500 }
      );
    }

    const streakData: StreakData = {
      currentStreak: result.rows[0].current_streak,
      longestStreak: result.rows[0].longest_streak,
      lastActivityDate: result.rows[0].last_activity_date,
      streakFreezeCount: result.rows[0].streak_freeze_count,
      totalDaysCompleted: result.rows[0].total_days_completed,
    };

    return NextResponse.json(
      {
        success: true,
        streak: streakData,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching streak:', error);
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
 * POST /api/kickstart/streak
 * Update streak when user completes a day
 * Body: { dayCompleted: true }
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

    // Call the database function to update streak
    const result = await pool.query<{
      current_streak: number;
      longest_streak: number;
      streak_extended: boolean;
    }>(
      'SELECT * FROM update_user_streak($1, $2)',
      [userId, 'kickstart']
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { success: false, error: 'Failed to update streak' },
        { status: 500 }
      );
    }

    const { current_streak, longest_streak, streak_extended } = result.rows[0];

    // Check for newly unlocked achievements
    const newlyUnlocked: Achievement[] = [];
    let totalPoints = 0;

    if (streak_extended) {
      // Get current progress data
      const progressData = await getUserProgressData(userId);

      // Get already unlocked achievements
      const unlockedResult = await pool.query<{ achievement_slug: string }>(
        'SELECT achievement_slug FROM user_achievements WHERE user_id = $1',
        [userId]
      );
      const unlockedSlugs = new Set(unlockedResult.rows.map((r) => r.achievement_slug));

      // Check all achievements
      for (const achievement of ACHIEVEMENTS) {
        if (unlockedSlugs.has(achievement.slug)) continue;

        const currentProgress = calculateCurrentProgress(achievement, progressData);

        if (currentProgress >= achievement.requirement.target) {
          const unlockResult = await pool.query(
            `SELECT * FROM check_and_unlock_achievement($1, $2, $3)`,
            [userId, achievement.slug, currentProgress]
          );

          if (unlockResult.rows[0]?.newly_unlocked) {
            newlyUnlocked.push(achievement);
            totalPoints += achievement.points;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      streak: {
        currentStreak: current_streak,
        longestStreak: longest_streak,
        extended: streak_extended,
      },
      message: streak_extended
        ? `🔥 Streak extended to ${current_streak} days!`
        : current_streak === 1
        ? '🔥 Streak started!'
        : 'Already completed today',
      achievements: newlyUnlocked.length > 0 ? {
        newly_unlocked: newlyUnlocked,
        total_points: totalPoints,
      } : undefined,
    });
  } catch (error) {
    console.error('Error updating streak:', error);
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
 * Helper: Extract user ID from authorization header
 * Replace this with your actual auth logic
 */
async function getUserIdFromAuth(authHeader: string): Promise<number | null> {
  try {
    // Remove 'Bearer ' prefix if present
    const token = authHeader.replace('Bearer ', '');

    // Simple token lookup in database
    // This assumes you store auth tokens in a sessions/tokens table
    // Adjust based on your actual authentication system
    const result = await pool.query<{ user_id: number }>(
      `SELECT user_id FROM user_sessions WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (result.rows.length > 0) {
      return result.rows[0].user_id;
    }

    // Fallback: Try to decode JWT or get from cookie
    // Add your actual auth logic here

    return null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
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
  progressData: Awaited<ReturnType<typeof getUserProgressData>>
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
