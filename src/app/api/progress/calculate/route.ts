import { NextRequest, NextResponse } from 'next/server';
import { calculateWeeklyMetrics, generateWeeklyInsights } from '@/lib/progress-tracker';
import { checkAndAwardBadges } from '@/lib/badge-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log(`🔄 Calculating progress metrics for user ${userId}...`);

    // Calculate weekly metrics
    const metrics = await calculateWeeklyMetrics(userId);
    console.log('✅ Weekly metrics calculated:', metrics);

    // Generate weekly insights
    const insights = await generateWeeklyInsights(userId) || [];
    console.log(`✅ Weekly insights generated: ${insights.length} insights`);

    // Check and award badges
    const badges = await checkAndAwardBadges(userId);
    console.log(`✅ Badges checked: ${badges.length} badges awarded`);

    return NextResponse.json({
      success: true,
      metrics,
      insightsCount: insights.length,
      badgesAwarded: badges.length
    });

  } catch (error) {
    console.error('Error calculating progress:', error);
    return NextResponse.json({
      error: 'Failed to calculate progress'
    }, { status: 500 });
  }
}