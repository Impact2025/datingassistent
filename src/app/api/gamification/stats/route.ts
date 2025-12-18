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

    // Get streak data from user_streaks table (uses last_activity_date, not login_date)
    const today = new Date().toISOString().split('T')[0];

    // First get streak data
    const streakResult = await sql`
      SELECT
        current_streak,
        longest_streak,
        last_activity_date,
        total_days_completed
      FROM user_streaks
      WHERE user_id = ${userId} AND program_slug = 'general'
    `;

    const streak = streakResult[0] || {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      total_days_completed: 0
    };

    // Check if logged in today
    const todayCompleted = streak.last_activity_date
      ? new Date(streak.last_activity_date).toISOString().split('T')[0] === today
      : false;

    // Try to get level milestones (may not exist)
    let levelTitle = 'Nieuweling';
    let nextLevelPoints = 100;
    try {
      const levelResult = await sql`
        SELECT title, points_required FROM level_milestones
        WHERE level <= 1 ORDER BY level DESC LIMIT 1
      `;
      if (levelResult.length > 0) {
        levelTitle = levelResult[0].title;
      }
      const nextLevelResult = await sql`
        SELECT points_required FROM level_milestones
        WHERE level = 2 LIMIT 1
      `;
      if (nextLevelResult.length > 0) {
        nextLevelPoints = nextLevelResult[0].points_required;
      }
    } catch (e) {
      // Level milestones table may not exist
    }

    const result = [{
      total_points: streak.total_days_completed * 10, // Estimate points from days
      current_level: 1,
      level_progress: 0,
      current_streak: streak.current_streak || 0,
      longest_streak: streak.longest_streak || 0,
      total_challenges_completed: 0,
      total_tools_completed: 0,
      level_title: levelTitle,
      next_level_points: nextLevelPoints,
      today_completed: todayCompleted ? 1 : 0
    }];

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
