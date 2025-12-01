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

    // Get user stats
    const stats = await sql`
      SELECT * FROM user_gamification_stats WHERE user_id = ${userId}
    `;

    if (stats.length === 0) {
      // Initialize stats for new user
      await sql`
        INSERT INTO user_gamification_stats (user_id)
        VALUES (${userId})
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
        nextLevelPoints: 100
      });
    }

    const userStats = stats[0];

    // Get level title and next level points
    const currentLevel = userStats.current_level || 1;
    const levelInfo = await sql`
      SELECT * FROM level_milestones WHERE level = ${currentLevel}
    `;

    const nextLevelInfo = await sql`
      SELECT * FROM level_milestones WHERE level = ${currentLevel + 1}
    `;

    const levelTitle = levelInfo.length > 0 ? levelInfo[0].title : 'Nieuweling';
    const nextLevelPoints = nextLevelInfo.length > 0 ? nextLevelInfo[0].points_required : 0;
    const pointsToNextLevel = Math.max(0, nextLevelPoints - userStats.total_points);

    // Check if logged in today
    const today = new Date().toISOString().split('T')[0];
    const todayLogin = await sql`
      SELECT * FROM user_streaks WHERE user_id = ${userId} AND login_date = ${today}
    `;

    return NextResponse.json({
      totalPoints: userStats.total_points || 0,
      currentLevel: userStats.current_level || 1,
      levelProgress: userStats.level_progress || 0,
      currentStreak: userStats.current_streak || 0,
      longestStreak: userStats.longest_streak || 0,
      todayCompleted: todayLogin.length > 0,
      levelTitle,
      pointsToNextLevel,
      nextLevelPoints,
      totalChallengesCompleted: userStats.total_challenges_completed || 0,
      totalToolsCompleted: userStats.total_tools_completed || 0
    });

  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
