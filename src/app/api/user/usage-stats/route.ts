import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getUserSubscription, PACKAGE_FEATURES } from '@/lib/neon-subscription';
import { getCourseUnlockStatus, getUnlockedCourseCount } from '@/lib/course-unlock';
import { getCurrentWeekProgress, getUserBadges } from '@/lib/progress-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription
    const subscription = await getUserSubscription(parseInt(userId));

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json({
        usage: {},
        limits: {},
        message: 'No active subscription'
      });
    }

    const packageType = subscription.packageType as keyof typeof PACKAGE_FEATURES;
    const limits = PACKAGE_FEATURES[packageType];

    // Calculate date ranges
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of month

    // Get usage statistics from api_usage table
    const weeklyUsage = await sql`
      SELECT
        COUNT(*) as total_requests,
        SUM(tokens_used) as total_tokens,
        SUM(cost_cents) as total_cost_cents
      FROM api_usage
      WHERE user_id = ${parseInt(userId)}
        AND created_at >= ${weekStart.toISOString()}
    `;

    const monthlyUsage = await sql`
      SELECT
        COUNT(*) as total_requests,
        SUM(tokens_used) as total_tokens,
        SUM(cost_cents) as total_cost_cents
      FROM api_usage
      WHERE user_id = ${parseInt(userId)}
        AND created_at >= ${monthStart.toISOString()}
    `;

    // Get course unlock status
    const courseUnlockStatus = await getCourseUnlockStatus(parseInt(userId));
    const unlockedCourseCount = await getUnlockedCourseCount(parseInt(userId));

    // Get weekly progress
    const weeklyProgress = await getCurrentWeekProgress(parseInt(userId));
    const userBadges = await getUserBadges(parseInt(userId));

    // For now, we'll estimate other usage based on AI requests
    // In a real implementation, you'd have separate tracking tables for each feature
    const weeklyRequests = parseInt(weeklyUsage.rows[0]?.total_requests) || 0;
    const monthlyRequests = parseInt(monthlyUsage.rows[0]?.total_requests) || 0;

    // Estimate usage based on request patterns (this is simplified)
    const usage = {
      aiMessagesWeekly: {
        used: Math.min(weeklyRequests, limits.aiMessagesPerWeek),
        limit: limits.aiMessagesPerWeek,
        percentage: Math.min((weeklyRequests / limits.aiMessagesPerWeek) * 100, 100)
      },
      profileRewritesMonthly: {
        used: Math.floor(monthlyRequests * 0.1), // Estimate: 10% of requests are profile rewrites
        limit: limits.profileRewritesRolling30Days,
        percentage: Math.min((monthlyRequests * 0.1 / limits.profileRewritesRolling30Days) * 100, 100)
      },
      photoChecksMonthly: {
        used: Math.floor(monthlyRequests * 0.05), // Estimate: 5% of requests are photo checks
        limit: limits.photoChecksRolling30Days,
        percentage: Math.min((monthlyRequests * 0.05 / limits.photoChecksRolling30Days) * 100, 100)
      },
      icebreakersDaily: {
        used: Math.floor(Math.random() * limits.icebreakersPerDay * 0.3), // Mock data for now
        limit: limits.icebreakersPerDay,
        percentage: Math.random() * 30 // Random percentage for demo
      },
      coursesUnlocked: {
        used: unlockedCourseCount,
        limit: limits.totalCoursesAccess,
        percentage: Math.min((unlockedCourseCount / limits.totalCoursesAccess) * 100, 100)
      },
      weeklyGoals: {
        used: Math.floor(weeklyProgress?.overallScore || 0),
        limit: 100, // Overall score out of 100
        percentage: weeklyProgress?.overallScore || 0
      },
      badgesEarned: {
        used: userBadges?.length || 0,
        limit: 20, // Assume 20 total badges available
        percentage: Math.min(((userBadges?.length || 0) / 20) * 100, 100)
      },
      tokensUsed: {
        weekly: parseInt(weeklyUsage.rows[0]?.total_tokens) || 0,
        monthly: parseInt(monthlyUsage.rows[0]?.total_tokens) || 0
      },
      costUsed: {
        weekly: (parseInt(weeklyUsage.rows[0]?.total_cost_cents) || 0) / 100, // Convert to euros
        monthly: (parseInt(monthlyUsage.rows[0]?.total_cost_cents) || 0) / 100
      }
    };

    return NextResponse.json({
      usage,
      limits,
      subscription: {
        packageType: subscription.packageType,
        billingPeriod: subscription.billingPeriod,
        status: subscription.status
      }
    });

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}