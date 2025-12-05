import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/users/stats - Get real-time user statistics
 * Returns comprehensive metrics for the admin user dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin(request);

    // Run all queries in parallel for performance
    const [
      totalResult,
      activeResult,
      premiumResult,
      todayResult,
      yesterdayResult,
      churnedResult
    ] = await Promise.all([
      // Total users (excluding admins)
      sql`SELECT COUNT(*) as count FROM users WHERE role = 'user'`,

      // Active users (logged in within last 30 days)
      sql`
        SELECT COUNT(*) as count FROM users
        WHERE role = 'user'
        AND last_login > NOW() - INTERVAL '30 days'
      `,

      // Premium users (have active program enrollment)
      sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM program_enrollments
        WHERE status = 'active'
      `,

      // New users today
      sql`
        SELECT COUNT(*) as count FROM users
        WHERE role = 'user'
        AND created_at >= CURRENT_DATE
      `,

      // New users yesterday (for comparison)
      sql`
        SELECT COUNT(*) as count FROM users
        WHERE role = 'user'
        AND created_at >= CURRENT_DATE - INTERVAL '1 day'
        AND created_at < CURRENT_DATE
      `,

      // Churned users (no login in 30+ days from older accounts)
      sql`
        SELECT COUNT(*) as count FROM users
        WHERE role = 'user'
        AND created_at < CURRENT_DATE - INTERVAL '30 days'
        AND (last_login IS NULL OR last_login < CURRENT_DATE - INTERVAL '30 days')
      `
    ]);

    const totalUsers = parseInt(totalResult.rows[0]?.count || '0');
    const activeUsers = parseInt(activeResult.rows[0]?.count || '0');
    const premiumUsers = parseInt(premiumResult.rows[0]?.count || '0');
    const newUsersToday = parseInt(todayResult.rows[0]?.count || '0');
    const newUsersYesterday = parseInt(yesterdayResult.rows[0]?.count || '0');
    const churnedUsers = parseInt(churnedResult.rows[0]?.count || '0');

    // Calculate churn rate
    const churnRate = totalUsers > 0
      ? Number(((churnedUsers / totalUsers) * 100).toFixed(1))
      : 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      premiumUsers,
      newUsersToday,
      churnRate
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}