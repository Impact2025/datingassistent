import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { irisMessageGenerator } from '@/lib/iris/message-generator';
import type { IrisContext } from '@/types/iris.types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * GET /api/iris/message
 * Get personalized Iris message for current day
 * Query params: dayNumber, dayTopic (optional)
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const dayNumber = parseInt(searchParams.get('dayNumber') || '1');
    const dayTopic = searchParams.get('dayTopic') || 'je dating vaardigheden';

    // Build context
    const context = await buildIrisContext(userId, dayNumber);

    // Generate best message
    const message = irisMessageGenerator.selectBestMessage(context, dayTopic);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error generating Iris message:', error);
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
 * Build comprehensive context for Iris
 */
async function buildIrisContext(userId: number, dayNumber: number): Promise<IrisContext> {
  const [streakResult, progressResult, achievementsResult] = await Promise.all([
    // Streak data
    pool.query<{ current_streak: number; longest_streak: number; total_days_completed: number }>(
      `SELECT current_streak, longest_streak, total_days_completed
       FROM user_streaks
       WHERE user_id = $1 AND program_slug = 'kickstart'`,
      [userId]
    ),

    // Progress data
    pool.query<{ last_completed_day: number; total_completed: number }>(
      `SELECT
        MAX(day_id) as last_completed_day,
        COUNT(DISTINCT CASE WHEN status = 'completed' THEN day_id END) as total_completed
       FROM kickstart_progress
       WHERE user_id = $1`,
      [userId]
    ),

    // Recent achievements
    pool.query<{ achievement_slug: string }>(
      `SELECT achievement_slug
       FROM user_achievements
       WHERE user_id = $1
       ORDER BY unlocked_at DESC
       LIMIT 3`,
      [userId]
    ),
  ]);

  const streakData = streakResult.rows[0] || {
    current_streak: 0,
    longest_streak: 0,
    total_days_completed: 0,
  };

  const lastCompletedDay = progressResult.rows[0]?.last_completed_day || 0;
  const totalCompleted = progressResult.rows[0]?.total_completed || 0;
  const completionPercentage = Math.round((totalCompleted / 21) * 100);

  const recentAchievements = achievementsResult.rows.map((r) => r.achievement_slug);

  return {
    userId,
    dayNumber,
    streakData,
    recentAchievements,
    completionPercentage,
    lastCompletedDay,
    daysUntilNextMilestone: calculateDaysToNextMilestone(totalCompleted),
  };
}

/**
 * Calculate days until next milestone (week completion)
 */
function calculateDaysToNextMilestone(completedDays: number): number {
  const milestones = [7, 14, 21];
  const nextMilestone = milestones.find((m) => m > completedDays);
  return nextMilestone ? nextMilestone - completedDays : 0;
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
