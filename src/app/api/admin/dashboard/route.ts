import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin(request);

    // Fetch real statistics from database
    const [
      userStats,
      subscriptionStats,
      courseStats,
      recentActivity
    ] = await Promise.all([
      // Total and active users
      sql`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users
        FROM users
      `,

      // Premium/subscription users
      sql`
        SELECT
          COUNT(CASE WHEN subscription_type = 'premium' OR subscription_status = 'active' THEN 1 END) as premium_users
        FROM users
      `,

      // Course/assessment stats
      sql`
        SELECT
          COUNT(DISTINCT user_id) as users_with_progress,
          COUNT(*) as total_progress_entries
        FROM user_progress
      `,

      // Recent activity (last 10 actions)
      sql`
        SELECT
          u.email,
          u.display_name,
          u.created_at,
          u.last_login
        FROM users u
        ORDER BY
          CASE
            WHEN u.last_login IS NOT NULL THEN u.last_login
            ELSE u.created_at
          END DESC
        LIMIT 10
      `
    ]);

    const totalUsers = Number(userStats.rows[0]?.total_users || 0);
    const activeUsers = Number(userStats.rows[0]?.active_users || 0);
    const premiumUsers = Number(subscriptionStats.rows[0]?.premium_users || 0);
    const usersWithProgress = Number(courseStats.rows[0]?.users_with_progress || 0);

    // Calculate conversion rate (premium / total users)
    const conversionRate = totalUsers > 0
      ? ((premiumUsers / totalUsers) * 100).toFixed(1)
      : '0.0';

    // Format recent activity
    const formattedActivity = recentActivity.rows.map((row, idx) => {
      const isNewUser = !row.last_login;
      const timestamp = row.last_login || row.created_at;

      return {
        id: String(idx + 1),
        type: isNewUser ? 'signup' : 'login',
        user: row.email || 'Unknown',
        action: isNewUser ? 'Nieuwe registratie' : 'Ingelogd',
        timestamp: timestamp
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        premiumUsers,
        totalAssessments: Number(courseStats.rows[0]?.total_progress_entries || 0),
        completedAssessments: 0, // We don't track this yet
        usersWithProgress,
        averageReadinessScore: 0, // Calculate this later if needed
        revenue: premiumUsers * 29.99, // Estimated based on premium users
        conversionRate: Number(conversionRate),
        systemHealth: {
          database: 'healthy',
          api: 'healthy',
          ai: 'healthy'
        },
        recentActivity: formattedActivity
      }
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);

    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard stats',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
