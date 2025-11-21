import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/users/stats - Get user statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin(request);

    // Get comprehensive user statistics
    const statsQuery = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) as active,
        0 as inactive,
        0 as suspended,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN COALESCE(subscription_status, 'free') = 'premium' THEN 1 END) as premium
      FROM users u
    `;

    const stats = statsQuery.rows[0];

    return NextResponse.json({
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      inactive: parseInt(stats.inactive),
      suspended: parseInt(stats.suspended),
      admins: parseInt(stats.admins),
      premium: parseInt(stats.premium)
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}