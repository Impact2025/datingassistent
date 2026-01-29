/**
 * Cron Job: Daily Management Report
 * Runs daily at 08:00 to send management stats to info@datingassistent.nl
 *
 * Vercel Cron: Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-management-report",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import AdminDailyReportEmail from '@/emails/admin-daily-report-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = 'info@datingassistent.nl';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@datingassistent.nl';

interface DailyStats {
  newUsersToday: number;
  newUsersYesterday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  revenueToday: number;
  revenueYesterday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  newSubscriptionsToday: number;
  cancelledToday: number;
  trialConversionsToday: number;
  activeUsersToday: number;
  activeUsersYesterday: number;
  totalAiMessages: number;
  totalToolUsage: number;
  newLeadsToday: number;
  hotLeadsToday: number;
  otoConversionsToday: number;
  emailsSentToday: number;
  emailOpenRate: number;
  emailClickRate: number;
  highChurnRiskUsers: number;
  pageViewsToday?: number;
  uniqueVisitorsToday?: number;
  topTrafficSources?: Array<{ source: string; count: number }>;
  // Technical metrics
  apiErrorsToday: number;
  apiErrorsYesterday: number;
  apiCallsToday: number;
  aiCostToday: number;
  aiCostThisMonth: number;
  avgResponseTimeMs: number;
  slowestEndpoint?: string;
  topErrors?: Array<{ endpoint: string; count: number; lastError: string }>;
}

async function safeQuery<T>(query: Promise<T>, defaultValue: T): Promise<T> {
  try {
    return await query;
  } catch (error) {
    console.error('Query failed:', error);
    return defaultValue;
  }
}

async function gatherDailyStats(): Promise<DailyStats> {
  // Get date boundaries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString();

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString();

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartISO = monthStart.toISOString();

  const emptyResult = { rows: [] };

  // Run all queries in parallel with error handling for each
  const [
    newUsersResult,
    revenueResult,
    subscriptionResult,
    engagementResult,
    otoResult,
    emailResult,
    churnResult,
    techStatsResult,
    topErrorsResult,
  ] = await Promise.all([
    // New users query
    safeQuery(sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at >= ${todayISO}) as today,
        COUNT(*) FILTER (WHERE created_at >= ${yesterdayISO} AND created_at < ${todayISO}) as yesterday,
        COUNT(*) FILTER (WHERE created_at >= ${weekAgoISO}) as this_week,
        COUNT(*) FILTER (WHERE created_at >= ${monthStartISO}) as this_month
      FROM users
    `, emptyResult),

    // Revenue query (from orders table - amount is in EUR, convert to cents)
    safeQuery(sql`
      SELECT
        COALESCE(SUM(amount * 100) FILTER (WHERE created_at >= ${todayISO} AND status = 'paid'), 0) as today,
        COALESCE(SUM(amount * 100) FILTER (WHERE created_at >= ${yesterdayISO} AND created_at < ${todayISO} AND status = 'paid'), 0) as yesterday,
        COALESCE(SUM(amount * 100) FILTER (WHERE created_at >= ${weekAgoISO} AND status = 'paid'), 0) as this_week,
        COALESCE(SUM(amount * 100) FILTER (WHERE created_at >= ${monthStartISO} AND status = 'paid'), 0) as this_month
      FROM orders
    `, emptyResult),

    // Subscription stats
    safeQuery(sql`
      SELECT
        COUNT(*) FILTER (WHERE subscription_status = 'active') as active_total,
        COUNT(*) FILTER (WHERE subscription_start_date >= ${todayISO} AND subscription_status = 'active') as new_today,
        COUNT(*) FILTER (WHERE subscription_status = 'cancelled' AND updated_at >= ${todayISO}) as cancelled_today,
        COUNT(*) FILTER (
          WHERE subscription_status = 'active'
          AND subscription_start_date >= ${todayISO}
          AND trial_status = 'converted'
        ) as trial_conversions
      FROM users
    `, emptyResult),

    // Engagement stats from usage_tracking
    safeQuery(sql`
      SELECT
        COUNT(DISTINCT CASE WHEN created_at >= ${todayISO} THEN user_id END) as active_today,
        COUNT(DISTINCT CASE WHEN created_at >= ${yesterdayISO} AND created_at < ${todayISO} THEN user_id END) as active_yesterday,
        COUNT(*) FILTER (WHERE feature_type = 'ai_message' AND created_at >= ${todayISO}) as ai_messages,
        COUNT(*) FILTER (WHERE feature_type IN ('icebreaker', 'photo_check', 'safety_check', 'bio_generator') AND created_at >= ${todayISO}) as tool_usage
      FROM usage_tracking
      WHERE created_at >= ${yesterdayISO}
    `, emptyResult),

    // OTO stats from oto_analytics table
    safeQuery(sql`
      SELECT
        COUNT(DISTINCT CASE WHEN event_type = 'oto_shown' AND created_at >= ${todayISO} THEN user_id END) as new_leads,
        COUNT(DISTINCT CASE WHEN event_type IN ('oto_accepted', 'downsell_accepted') AND created_at >= ${todayISO} THEN user_id END) as oto_conversions,
        COUNT(DISTINCT CASE WHEN event_type = 'oto_accepted' AND oto_product = 'transformatie' AND created_at >= ${todayISO} THEN user_id END) as hot_leads
      FROM oto_analytics
    `, emptyResult),

    // Email performance from email_tracking
    safeQuery(sql`
      SELECT
        COUNT(*) FILTER (WHERE sent_at >= ${todayISO}) as sent_today,
        COALESCE(
          COUNT(*) FILTER (WHERE opened_at IS NOT NULL AND sent_at >= ${weekAgoISO})::float /
          NULLIF(COUNT(*) FILTER (WHERE sent_at >= ${weekAgoISO}), 0) * 100,
          0
        ) as open_rate,
        COALESCE(
          COUNT(*) FILTER (WHERE clicked_at IS NOT NULL AND sent_at >= ${weekAgoISO})::float /
          NULLIF(COUNT(*) FILTER (WHERE sent_at >= ${weekAgoISO}), 0) * 100,
          0
        ) as click_rate
      FROM email_tracking
    `, emptyResult),

    // Churn risk - count users inactive for 7+ days with active subscriptions
    safeQuery(sql`
      SELECT COUNT(*) as high_risk
      FROM users
      WHERE subscription_status = 'active'
        AND last_login < NOW() - INTERVAL '7 days'
    `, emptyResult),

    // Technical: API errors and performance from api_usage table
    safeQuery(sql`
      SELECT
        COUNT(*) FILTER (WHERE (status_code >= 400 OR error_message IS NOT NULL) AND created_at >= ${todayISO}) as errors_today,
        COUNT(*) FILTER (WHERE (status_code >= 400 OR error_message IS NOT NULL) AND created_at >= ${yesterdayISO} AND created_at < ${todayISO}) as errors_yesterday,
        COUNT(*) FILTER (WHERE created_at >= ${todayISO}) as calls_today,
        COALESCE(SUM(cost_cents) FILTER (WHERE created_at >= ${todayISO}), 0) as cost_today,
        COALESCE(SUM(cost_cents) FILTER (WHERE created_at >= ${monthStartISO}), 0) as cost_month,
        COALESCE(AVG(request_duration_ms) FILTER (WHERE created_at >= ${todayISO}), 0) as avg_response_ms
      FROM api_usage
    `, emptyResult),

    // Technical: Top errors by endpoint
    safeQuery(sql`
      SELECT
        endpoint,
        COUNT(*) as error_count,
        MAX(error_message) as last_error
      FROM api_usage
      WHERE (status_code >= 400 OR error_message IS NOT NULL)
        AND created_at >= ${todayISO}
        AND endpoint IS NOT NULL
      GROUP BY endpoint
      ORDER BY error_count DESC
      LIMIT 5
    `, emptyResult),
  ]);

  return {
    // New users
    newUsersToday: parseInt(newUsersResult.rows[0]?.today || '0'),
    newUsersYesterday: parseInt(newUsersResult.rows[0]?.yesterday || '0'),
    newUsersThisWeek: parseInt(newUsersResult.rows[0]?.this_week || '0'),
    newUsersThisMonth: parseInt(newUsersResult.rows[0]?.this_month || '0'),

    // Revenue (in cents)
    revenueToday: parseInt(revenueResult.rows[0]?.today || '0'),
    revenueYesterday: parseInt(revenueResult.rows[0]?.yesterday || '0'),
    revenueThisWeek: parseInt(revenueResult.rows[0]?.this_week || '0'),
    revenueThisMonth: parseInt(revenueResult.rows[0]?.this_month || '0'),

    // Subscriptions
    activeSubscriptions: parseInt(subscriptionResult.rows[0]?.active_total || '0'),
    newSubscriptionsToday: parseInt(subscriptionResult.rows[0]?.new_today || '0'),
    cancelledToday: parseInt(subscriptionResult.rows[0]?.cancelled_today || '0'),
    trialConversionsToday: parseInt(subscriptionResult.rows[0]?.trial_conversions || '0'),

    // Engagement
    activeUsersToday: parseInt(engagementResult.rows[0]?.active_today || '0'),
    activeUsersYesterday: parseInt(engagementResult.rows[0]?.active_yesterday || '0'),
    totalAiMessages: parseInt(engagementResult.rows[0]?.ai_messages || '0'),
    totalToolUsage: parseInt(engagementResult.rows[0]?.tool_usage || '0'),

    // Leads/OTO
    newLeadsToday: parseInt(otoResult.rows[0]?.new_leads || '0'),
    hotLeadsToday: parseInt(otoResult.rows[0]?.hot_leads || '0'),
    otoConversionsToday: parseInt(otoResult.rows[0]?.oto_conversions || '0'),

    // Email
    emailsSentToday: parseInt(emailResult.rows[0]?.sent_today || '0'),
    emailOpenRate: parseFloat(emailResult.rows[0]?.open_rate || '0'),
    emailClickRate: parseFloat(emailResult.rows[0]?.click_rate || '0'),

    // Churn
    highChurnRiskUsers: parseInt(churnResult.rows[0]?.high_risk || '0'),

    // Technical metrics
    apiErrorsToday: parseInt(techStatsResult.rows[0]?.errors_today || '0'),
    apiErrorsYesterday: parseInt(techStatsResult.rows[0]?.errors_yesterday || '0'),
    apiCallsToday: parseInt(techStatsResult.rows[0]?.calls_today || '0'),
    aiCostToday: parseInt(techStatsResult.rows[0]?.cost_today || '0'),
    aiCostThisMonth: parseInt(techStatsResult.rows[0]?.cost_month || '0'),
    avgResponseTimeMs: parseFloat(techStatsResult.rows[0]?.avg_response_ms || '0'),
    topErrors: topErrorsResult.rows.map((row: any) => ({
      endpoint: row.endpoint || 'unknown',
      count: parseInt(row.error_count || '0'),
      lastError: row.last_error || 'Unknown error',
    })),
  };
}

async function sendDailyReport(stats: DailyStats): Promise<boolean> {
  const reportDate = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const html = await render(
      AdminDailyReportEmail({
        stats,
        reportDate,
        dashboardUrl: 'https://datingassistent.nl/admin',
      }),
      { pretty: true }
    );

    // Create plain text version
    const textContent = `
DatingAssistent Dagrapport - ${reportDate}

VANDAAG IN HET KORT
-------------------
Nieuwe leden: ${stats.newUsersToday}
Omzet: €${(stats.revenueToday / 100).toFixed(2)}
Actieve gebruikers: ${stats.activeUsersToday}
Hot leads: ${stats.hotLeadsToday}

NIEUWE LEDEN
------------
Vandaag: ${stats.newUsersToday}
Gisteren: ${stats.newUsersYesterday}
Deze week: ${stats.newUsersThisWeek}
Deze maand: ${stats.newUsersThisMonth}

OMZET
-----
Vandaag: €${(stats.revenueToday / 100).toFixed(2)}
Gisteren: €${(stats.revenueYesterday / 100).toFixed(2)}
Deze week: €${(stats.revenueThisWeek / 100).toFixed(2)}
Deze maand: €${(stats.revenueThisMonth / 100).toFixed(2)}

ABONNEMENTEN
------------
Actief totaal: ${stats.activeSubscriptions}
Nieuw vandaag: ${stats.newSubscriptionsToday}
Geannuleerd: ${stats.cancelledToday}
Trial conversies: ${stats.trialConversionsToday}

ENGAGEMENT
----------
Actieve users vandaag: ${stats.activeUsersToday}
AI berichten: ${stats.totalAiMessages}
Tool gebruik: ${stats.totalToolUsage}
Hoog churn risico: ${stats.highChurnRiskUsers}

LEADS
-----
Nieuwe leads: ${stats.newLeadsToday}
Hot leads: ${stats.hotLeadsToday}
OTO conversies: ${stats.otoConversionsToday}

EMAIL PERFORMANCE
-----------------
Verzonden vandaag: ${stats.emailsSentToday}
Open rate: ${stats.emailOpenRate.toFixed(1)}%
Click rate: ${stats.emailClickRate.toFixed(1)}%

---
Admin Dashboard: https://datingassistent.nl/admin
    `.trim();

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 DAILY REPORT NOT SENT (Resend not configured)');
      console.log('To:', ADMIN_EMAIL);
      console.log('Subject:', `Dagrapport ${reportDate}`);
      console.log(textContent);
      return true;
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📊 Dagrapport ${new Date().toLocaleDateString('nl-NL')}: ${stats.newUsersToday} nieuwe leden, €${(stats.revenueToday / 100).toFixed(2)} omzet`,
      html,
      text: textContent,
    });

    if (result.error) {
      console.error('❌ Error sending daily report:', result.error);
      return false;
    }

    console.log(`✅ Daily report sent to ${ADMIN_EMAIL} (ID: ${result.data?.id})`);
    return true;
  } catch (error) {
    console.error('❌ Error rendering/sending daily report:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('[CRON] Starting daily management report...');
    const startTime = Date.now();

    // Gather all statistics
    const stats = await gatherDailyStats();

    // Send the report
    const sent = await sendDailyReport(stats);

    const duration = Date.now() - startTime;
    console.log(`[CRON] Daily report completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      sent,
      stats: {
        newUsersToday: stats.newUsersToday,
        revenueToday: stats.revenueToday,
        activeUsersToday: stats.activeUsersToday,
        hotLeadsToday: stats.hotLeadsToday,
      },
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Daily report error:', error);
    return NextResponse.json(
      { error: 'Daily report failed', details: String(error) },
      { status: 500 }
    );
  }
}
