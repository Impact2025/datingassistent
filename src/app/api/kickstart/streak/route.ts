import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

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
