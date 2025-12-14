import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/gamification/stats
 * Get user's gamification stats (points, level, streak)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = parseInt(searchParams.get('userId') || '');

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // PERFORMANCE: Single optimized query with JOINs instead of 4 separate queries
    // Prevents N+1 query pattern and reduces database roundtrips
    const today = new Date().toISOString().split('T')[0];

    const result = await sql`
      WITH user_stats AS (
        SELECT * FROM user_gamification_stats WHERE user_id = ${userId}
      ),
      today_streak AS (
        SELECT 1 as logged_in_today FROM user_streaks
        WHERE user_id = ${userId} AND login_date = ${today}
        LIMIT 1
      )
      SELECT
        COALESCE(us.total_points, 0) as total_points,
        COALESCE(us.current_level, 1) as current_level,
        COALESCE(us.level_progress, 0) as level_progress,
        COALESCE(us.current_streak, 0) as current_streak,
        COALESCE(us.longest_streak, 0) as longest_streak,
        COALESCE(us.total_challenges_completed, 0) as total_challenges_completed,
        COALESCE(us.total_tools_completed, 0) as total_tools_completed,
        COALESCE(lm_current.title, 'Nieuweling') as level_title,
        COALESCE(lm_next.points_required, 100) as next_level_points,
        COALESCE(ts.logged_in_today, 0) as today_completed
      FROM user_stats us
      LEFT JOIN level_milestones lm_current ON lm_current.level = COALESCE(us.current_level, 1)
      LEFT JOIN level_milestones lm_next ON lm_next.level = COALESCE(us.current_level, 1) + 1
      LEFT JOIN today_streak ts ON true
    `;

    // If no stats exist, initialize them
    if (result.length === 0 || result[0].total_points === null) {
      await sql`
        INSERT INTO user_gamification_stats (user_id)
        VALUES (${userId})
        ON CONFLICT (user_id) DO NOTHING
      `;

      return NextResponse.json({
        totalPoints: 0,
        currentLevel: 1,
        levelProgress: 0,
        currentStreak: 0,
        longestStreak: 0,
        todayCompleted: false,
        levelTitle: 'Nieuweling',
        pointsToNextLevel: 100,
        nextLevelPoints: 100,
        totalChallengesCompleted: 0,
        totalToolsCompleted: 0
      });
    }

    const data = result[0];
    const pointsToNextLevel = Math.max(0, data.next_level_points - data.total_points);

    return NextResponse.json({
      totalPoints: data.total_points,
      currentLevel: data.current_level,
      levelProgress: data.level_progress,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      todayCompleted: data.today_completed > 0,
      levelTitle: data.level_title,
      pointsToNextLevel,
      nextLevelPoints: data.next_level_points,
      totalChallengesCompleted: data.total_challenges_completed,
      totalToolsCompleted: data.total_tools_completed
    });

  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
