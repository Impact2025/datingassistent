/**
 * ENHANCED ADMIN DASHBOARD API
 * Wereldklasse dashboard met echte groei berekeningen
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';

interface GrowthMetric {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

function calculateGrowth(current: number, previous: number): GrowthMetric {
  if (previous === 0) {
    return {
      value: current,
      percentage: current > 0 ? 100 : 0,
      trend: current > 0 ? 'up' : 'stable'
    };
  }

  const percentage = ((current - previous) / previous) * 100;
  const roundedPercentage = Math.round(percentage * 10) / 10;

  return {
    value: current - previous,
    percentage: roundedPercentage,
    trend: percentage > 1 ? 'up' : percentage < -1 ? 'down' : 'stable'
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    // Parallelle queries voor maximale snelheid
    const [
      currentPeriodStats,
      previousPeriodStats,
      recentActivity,
      systemHealth
    ] = await Promise.all([
      // Huidige periode (laatste 30 dagen)
      sql`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users,
          COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as premium_users,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
        FROM users
      `,

      // Vorige periode (30-60 dagen geleden)
      sql`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN last_login > NOW() - INTERVAL '37 days' AND last_login <= NOW() - INTERVAL '7 days' THEN 1 END) as active_users,
          COUNT(CASE WHEN subscription_status = 'active' AND created_at <= NOW() - INTERVAL '30 days' THEN 1 END) as premium_users,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '60 days' AND created_at <= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_prev
        FROM users
      `,

      // Recent activity (laatste 20 acties)
      sql`
        SELECT
          id,
          email,
          display_name,
          created_at,
          last_login,
          subscription_status,
          CASE
            WHEN created_at > NOW() - INTERVAL '1 day' THEN 'signup'
            WHEN subscription_status = 'active' AND created_at > NOW() - INTERVAL '7 days' THEN 'subscription'
            ELSE 'login'
          END as activity_type
        FROM users
        WHERE last_login IS NOT NULL OR created_at > NOW() - INTERVAL '7 days'
        ORDER BY GREATEST(COALESCE(last_login, created_at), created_at) DESC
        LIMIT 20
      `,

      // System health check
      sql`SELECT 1 as healthy`
    ]);

    // Parse current stats
    const current = currentPeriodStats.rows[0];
    const totalUsers = Number(current.total_users || 0);
    const activeUsers = Number(current.active_users || 0);
    const premiumUsers = Number(current.premium_users || 0);
    const newUsers30d = Number(current.new_users_30d || 0);

    // Parse previous stats
    const previous = previousPeriodStats.rows[0];
    const prevTotalUsers = Math.max(totalUsers - newUsers30d, 1);
    const prevActiveUsers = Number(previous.active_users || 0);
    const prevPremiumUsers = Number(previous.premium_users || 0);
    const prevNewUsers = Number(previous.new_users_prev || 0);

    // Revenue berekening (geschat op basis van premium users)
    const monthlyPrice = 29.99;
    const currentRevenue = premiumUsers * monthlyPrice;
    const previousRevenue = prevPremiumUsers * monthlyPrice;

    // Conversion rate
    const currentConversion = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
    const previousConversion = prevTotalUsers > 0 ? (prevPremiumUsers / prevTotalUsers) * 100 : 0;

    // Calculate growth metrics
    const growth = {
      users: calculateGrowth(newUsers30d, prevNewUsers),
      revenue: calculateGrowth(currentRevenue, previousRevenue),
      activeUsers: calculateGrowth(activeUsers, prevActiveUsers),
      conversions: calculateGrowth(currentConversion, previousConversion)
    };

    // Format recent activity
    const formattedActivity = recentActivity.rows.map((row, idx) => {
      const activityType = row.activity_type as string;
      let action = '';

      switch (activityType) {
        case 'signup':
          action = 'Nieuwe registratie';
          break;
        case 'subscription':
          action = 'Premium gestart';
          break;
        default:
          action = 'Ingelogd';
      }

      return {
        id: String(row.id || idx + 1),
        type: activityType,
        user: row.email || 'Onbekend',
        action,
        timestamp: row.last_login || row.created_at,
        metadata: {
          displayName: row.display_name
        }
      };
    });

    // System health (in productie: echte checks)
    const dbHealthy = systemHealth.rows.length > 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        premiumUsers,
        totalAssessments: 0, // TODO: koppelen aan echte assessments
        completedAssessments: 0,
        usersWithProgress: 0,
        averageReadinessScore: 0,
        revenue: Math.round(currentRevenue * 100) / 100,
        conversionRate: Math.round(currentConversion * 10) / 10,
        systemHealth: {
          database: dbHealthy ? 'healthy' : 'error',
          api: 'healthy',
          ai: 'healthy'
        },
        recentActivity: formattedActivity,
        growth
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Enhanced dashboard error:', error);

    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
