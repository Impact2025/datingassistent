import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/user-insights - Advanced user analytics for admin
 *
 * Returns:
 * - Stuck users (pending verification, verified but not active)
 * - Conversion funnel metrics
 * - Onboarding drop-off points
 * - Recent user activity
 * - Cohort analysis
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const includeStuckUsers = searchParams.get('includeStuckUsers') !== 'false';

    // 1. Overall metrics
    const metricsQuery = await sql`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as users_24h,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as users_7d,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as users_30d,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN email_verified = false THEN 1 END) as unverified_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login IS NULL THEN 1 END) as never_logged_in,
        COUNT(CASE WHEN lead_onboarding_completed = true THEN 1 END) as completed_onboarding,
        COUNT(CASE WHEN lead_oto_shown = true THEN 1 END) as saw_oto,
        COUNT(CASE WHEN subscription_status != 'free' THEN 1 END) as paid_users
      FROM users
    `;

    // 2. Conversion Funnel - Use parameterized query
    const intervalStr = `${days} days`;
    const funnelQuery = await sql.query(
      `SELECT
        COUNT(*) as registered,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_email,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as first_login,
        COUNT(CASE WHEN lead_onboarding_completed = true THEN 1 END) as completed_onboarding,
        COUNT(CASE WHEN lead_oto_shown = true THEN 1 END) as saw_oto,
        COUNT(CASE WHEN subscription_status != 'free' THEN 1 END) as converted_paid
      FROM users
      WHERE created_at >= NOW() - INTERVAL $1`,
      [intervalStr]
    );

    // 3. Stuck Users Detection
    let stuckUsers: any[] = [];
    if (includeStuckUsers) {
      const stuckUsersQuery = await sql.query(
        `SELECT
          id,
          name,
          email,
          created_at,
          email_verified,
          last_login,
          lead_onboarding_completed,
          verification_code,
          code_expires_at,
          CASE
            WHEN email_verified = false AND verification_code IS NOT NULL AND code_expires_at < NOW() THEN 'verification_expired'
            WHEN email_verified = false AND verification_code IS NOT NULL THEN 'pending_verification'
            WHEN email_verified = true AND last_login IS NULL AND created_at < NOW() - INTERVAL '1 hour' THEN 'verified_not_logged_in'
            WHEN email_verified = true AND last_login IS NOT NULL AND lead_onboarding_completed = false AND created_at < NOW() - INTERVAL '1 day' THEN 'started_not_completed'
            ELSE 'unknown'
          END as stuck_reason
        FROM users
        WHERE
          created_at >= NOW() - INTERVAL $1
          AND (
            (email_verified = false) OR
            (email_verified = true AND last_login IS NULL AND created_at < NOW() - INTERVAL '1 hour') OR
            (email_verified = true AND last_login IS NOT NULL AND lead_onboarding_completed = false AND created_at < NOW() - INTERVAL '1 day')
          )
        ORDER BY created_at DESC
        LIMIT 100`,
        [intervalStr]
      );

      stuckUsers = stuckUsersQuery.rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        onboardingCompleted: user.lead_onboarding_completed,
        stuckReason: user.stuck_reason,
        hasExpiredCode: user.code_expires_at ? new Date(user.code_expires_at) < new Date() : false
      }));
    }

    // 4. Daily Registration Trend (last N days)
    const trendQuery = await sql.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as registrations,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verifications,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as activations
      FROM users
      WHERE created_at >= NOW() - INTERVAL $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC`,
      [intervalStr]
    );

    // 5. Drop-off Analysis
    const dropOffQuery = await sql.query(
      `SELECT
        COUNT(CASE WHEN email_verified = false THEN 1 END) as dropped_at_verification,
        COUNT(CASE WHEN email_verified = true AND last_login IS NULL THEN 1 END) as dropped_after_verification,
        COUNT(CASE WHEN last_login IS NOT NULL AND lead_onboarding_completed = false THEN 1 END) as dropped_during_onboarding,
        COUNT(CASE WHEN lead_onboarding_completed = true AND lead_oto_shown = false THEN 1 END) as dropped_before_oto,
        COUNT(CASE WHEN lead_oto_shown = true AND subscription_status = 'free' THEN 1 END) as dropped_after_oto
      FROM users
      WHERE created_at >= NOW() - INTERVAL $1`,
      [intervalStr]
    );

    // 6. Recent Activity (last 50 users)
    const recentUsersQuery = await sql.query(
      `SELECT
        id,
        name,
        email,
        created_at,
        last_login,
        email_verified,
        lead_onboarding_completed,
        subscription_status,
        CASE
          WHEN last_login IS NULL AND email_verified = false THEN 'pending_verification'
          WHEN last_login IS NULL AND email_verified = true THEN 'verified_not_active'
          WHEN last_login IS NOT NULL AND lead_onboarding_completed = false THEN 'onboarding_in_progress'
          WHEN lead_onboarding_completed = true THEN 'onboarding_complete'
          ELSE 'unknown'
        END as user_stage
      FROM users
      WHERE created_at >= NOW() - INTERVAL $1
      ORDER BY created_at DESC
      LIMIT 50`,
      [intervalStr]
    );

    const metrics = metricsQuery.rows[0];
    const funnel = funnelQuery.rows[0];
    const dropOff = dropOffQuery.rows[0];
    const trend = trendQuery.rows;
    const recentUsers = recentUsersQuery.rows;

    // Calculate conversion rates
    const conversionRates = {
      registration_to_verification: funnel.registered > 0
        ? Math.round((funnel.verified_email / funnel.registered) * 100)
        : 0,
      verification_to_login: funnel.verified_email > 0
        ? Math.round((funnel.first_login / funnel.verified_email) * 100)
        : 0,
      login_to_onboarding: funnel.first_login > 0
        ? Math.round((funnel.completed_onboarding / funnel.first_login) * 100)
        : 0,
      onboarding_to_oto: funnel.completed_onboarding > 0
        ? Math.round((funnel.saw_oto / funnel.completed_onboarding) * 100)
        : 0,
      oto_to_paid: funnel.saw_oto > 0
        ? Math.round((funnel.converted_paid / funnel.saw_oto) * 100)
        : 0,
      overall: funnel.registered > 0
        ? Math.round((funnel.converted_paid / funnel.registered) * 100)
        : 0
    };

    return NextResponse.json({
      metrics: {
        totalUsers: parseInt(metrics.total_users),
        users24h: parseInt(metrics.users_24h),
        users7d: parseInt(metrics.users_7d),
        users30d: parseInt(metrics.users_30d),
        verifiedUsers: parseInt(metrics.verified_users),
        unverifiedUsers: parseInt(metrics.unverified_users),
        activeUsers: parseInt(metrics.active_users),
        neverLoggedIn: parseInt(metrics.never_logged_in),
        completedOnboarding: parseInt(metrics.completed_onboarding),
        sawOTO: parseInt(metrics.saw_oto),
        paidUsers: parseInt(metrics.paid_users)
      },
      funnel: {
        registered: parseInt(funnel.registered),
        verifiedEmail: parseInt(funnel.verified_email),
        firstLogin: parseInt(funnel.first_login),
        completedOnboarding: parseInt(funnel.completed_onboarding),
        sawOTO: parseInt(funnel.saw_oto),
        convertedPaid: parseInt(funnel.converted_paid)
      },
      conversionRates,
      dropOff: {
        atVerification: parseInt(dropOff.dropped_at_verification),
        afterVerification: parseInt(dropOff.dropped_after_verification),
        duringOnboarding: parseInt(dropOff.dropped_during_onboarding),
        beforeOTO: parseInt(dropOff.dropped_before_oto),
        afterOTO: parseInt(dropOff.dropped_after_oto)
      },
      stuckUsers,
      trend: trend.map(t => ({
        date: t.date,
        registrations: parseInt(t.registrations),
        verifications: parseInt(t.verifications),
        activations: parseInt(t.activations)
      })),
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.created_at,
        lastLogin: u.last_login,
        emailVerified: u.email_verified,
        onboardingCompleted: u.lead_onboarding_completed,
        subscriptionStatus: u.subscription_status,
        stage: u.user_stage
      })),
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('User insights error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
