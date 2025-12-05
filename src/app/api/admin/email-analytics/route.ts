/**
 * Admin Email Analytics API
 * Provides comprehensive email statistics and insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

interface EmailTypeStats {
  emailType: string;
  count: number;
  openRate: number;
  clickRate: number;
}

interface DailyStats {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await verifyAdminSession(sessionToken);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const emailType = searchParams.get('type');

    // Calculate date range
    let intervalDays = 30;
    switch (period) {
      case '7d': intervalDays = 7; break;
      case '30d': intervalDays = 30; break;
      case '90d': intervalDays = 90; break;
      case '365d': intervalDays = 365; break;
    }

    // Get overall stats
    const overallStats = await sql`
      SELECT
        COUNT(*) as total_sent,
        COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as total_delivered,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as total_clicked,
        COUNT(CASE WHEN bounced = true THEN 1 END) as total_bounced,
        COUNT(CASE WHEN unsubscribed = true THEN 1 END) as total_unsubscribed
      FROM email_tracking
      WHERE sent_at > NOW() - INTERVAL '${intervalDays} days'
        ${emailType ? sql`AND email_type = ${emailType}` : sql``}
    `;

    const stats = overallStats.rows[0];
    const totalSent = parseInt(stats.total_sent) || 0;
    const totalDelivered = parseInt(stats.total_delivered) || totalSent;
    const totalOpened = parseInt(stats.total_opened) || 0;
    const totalClicked = parseInt(stats.total_clicked) || 0;
    const totalBounced = parseInt(stats.total_bounced) || 0;
    const totalUnsubscribed = parseInt(stats.total_unsubscribed) || 0;

    const emailStats: EmailStats = {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      openRate: totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0,
      clickRate: totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0,
      bounceRate: totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0,
      unsubscribeRate: totalSent > 0 ? Math.round((totalUnsubscribed / totalSent) * 100) : 0,
    };

    // Get stats by email type
    const typeStatsResult = await sql`
      SELECT
        email_type,
        COUNT(*) as count,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked
      FROM email_tracking
      WHERE sent_at > NOW() - INTERVAL '${intervalDays} days'
      GROUP BY email_type
      ORDER BY count DESC
      LIMIT 10
    `;

    const typeStats: EmailTypeStats[] = typeStatsResult.rows.map(row => ({
      emailType: row.email_type,
      count: parseInt(row.count),
      openRate: parseInt(row.count) > 0 ? Math.round((parseInt(row.opened) / parseInt(row.count)) * 100) : 0,
      clickRate: parseInt(row.opened) > 0 ? Math.round((parseInt(row.clicked) / parseInt(row.opened)) * 100) : 0,
    }));

    // Get daily stats for chart
    const dailyStatsResult = await sql`
      SELECT
        DATE(sent_at) as date,
        COUNT(*) as sent,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked
      FROM email_tracking
      WHERE sent_at > NOW() - INTERVAL '${intervalDays} days'
      GROUP BY DATE(sent_at)
      ORDER BY date ASC
    `;

    const dailyStats: DailyStats[] = dailyStatsResult.rows.map(row => ({
      date: row.date,
      sent: parseInt(row.sent),
      opened: parseInt(row.opened),
      clicked: parseInt(row.clicked),
    }));

    // Get queue status
    const queueStatus = await sql`
      SELECT
        status,
        COUNT(*) as count
      FROM email_queue
      WHERE scheduled_for > NOW() - INTERVAL '7 days'
      GROUP BY status
    `;

    const queueStats = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
    };

    queueStatus.rows.forEach(row => {
      queueStats[row.status as keyof typeof queueStats] = parseInt(row.count);
    });

    // Get recent emails
    const recentEmails = await sql`
      SELECT
        et.id,
        et.email_type,
        et.email_category,
        et.sent_at,
        et.opened_at,
        et.clicked_at,
        u.email as user_email,
        u.name as user_name
      FROM email_tracking et
      JOIN users u ON et.user_id = u.id
      ORDER BY et.sent_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      success: true,
      period,
      stats: emailStats,
      typeStats,
      dailyStats,
      queueStats,
      recentEmails: recentEmails.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email analytics', details: String(error) },
      { status: 500 }
    );
  }
}
