import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard entries (privacy-aware)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = parseInt(searchParams.get('userId') || '');
    const period = searchParams.get('period') || 'week';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get leaderboard entries (only visible users + current user)
    const entries = await sql`
      SELECT
        u.id as user_id,
        COALESCE(u.name, 'Anoniem') as display_name,
        g.total_points,
        g.current_level,
        g.current_streak,
        RANK() OVER (ORDER BY g.total_points DESC) as rank
      FROM user_gamification_stats g
      JOIN users u ON u.id = g.user_id
      WHERE g.total_points > 0
        AND (
          EXISTS (
            SELECT 1 FROM leaderboard_entries le
            WHERE le.user_id = u.id AND le.is_visible = true
          )
          OR u.id = ${userId}
        )
      ORDER BY g.total_points DESC
      LIMIT ${limit}
    `;

    // Format entries
    const formattedEntries = entries.map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.user_id,
      displayName: entry.user_id === userId
        ? entry.display_name
        : `Dating Expert ${entry.rank}`,  // Anonymize other users
      totalPoints: entry.total_points || 0,
      currentLevel: entry.current_level || 1,
      currentStreak: entry.current_streak || 0,
      isCurrentUser: entry.user_id === userId
    }));

    return NextResponse.json({
      entries: formattedEntries,
      period,
      total: formattedEntries.length
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
