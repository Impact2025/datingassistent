import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';

interface SuccessMetrics {
  overallScore: number;
  weeklyProgress: {
    week: string;
    score: number;
    activities: number;
    matches: number;
    conversations: number;
  }[];
  keyMetrics: {
    profileViews: number;
    messagesSent: number;
    responseRate: number;
    matchRate: number;
    conversationDepth: number;
    dateSuccess: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    metric: string;
  }[];
  insights: {
    type: 'success' | 'improvement' | 'warning' | 'tip';
    title: string;
    description: string;
    actionable: boolean;
  }[];
  predictions: {
    nextWeekActivity: number;
    expectedMatches: number;
    confidence: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = await rateLimitExpensiveAI(identifier);

    if (!rateLimit.success) {
      const headers = createRateLimitHeaders(rateLimit);
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Te veel verzoeken. Probeer opnieuw na ${resetDate.toLocaleTimeString('nl-NL')}.`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || 'month';

    if (!userId || userId !== user.id.toString()) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Fetch user activity data
    const activities = await sql`
      SELECT
        activity_type,
        activity_data,
        points_earned,
        created_at,
        DATE_TRUNC('week', created_at) as week_start
      FROM user_activity_log
      WHERE user_id = ${userId}
        AND created_at >= ${startDate.toISOString()}
      ORDER BY created_at DESC
    `;

    // Generate mock metrics for now (in production, this would analyze real data)
    const metrics = await generateSuccessMetrics(activities.rows, timeRange);

    return NextResponse.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('Success metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to generate success metrics' },
      { status: 500 }
    );
  }
}

async function generateSuccessMetrics(activities: any[], timeRange: string): Promise<SuccessMetrics> {
  // Calculate basic metrics from activities
  const totalActivities = activities.length;
  const profileActivities = activities.filter(a => a.activity_type === 'profile_analysis').length;
  const chatActivities = activities.filter(a => a.activity_type === 'chat_coach').length;
  const dateActivities = activities.filter(a => a.activity_type === 'date_planner').length;

  // Generate weekly progress
  const weeklyProgress = [];
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  for (let i = 0; i < 4; i++) {
    const weekActivities = activities.filter(a => {
      const activityDate = new Date(a.created_at);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return activityDate >= weekStart && activityDate < weekEnd;
    });

    weeklyProgress.unshift({
      week: weeks[3 - i],
      score: Math.min(100, 20 + (weekActivities.length * 15) + Math.random() * 20),
      activities: weekActivities.length,
      matches: Math.floor(Math.random() * 5),
      conversations: Math.floor(Math.random() * 10)
    });
  }

  // Calculate overall score based on activity diversity and frequency
  const activityDiversity = [profileActivities, chatActivities, dateActivities].filter(count => count > 0).length;
  const activityFrequency = totalActivities / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90);
  const overallScore = Math.min(100, Math.max(0,
    (activityDiversity * 20) +
    (activityFrequency * 30) +
    (totalActivities * 2) +
    Math.random() * 20
  ));

  // Generate key metrics (mock data for now)
  const keyMetrics = {
    profileViews: Math.floor(Math.random() * 200) + 50,
    messagesSent: totalActivities * 3 + Math.floor(Math.random() * 20),
    responseRate: Math.floor(Math.random() * 40) + 30,
    matchRate: Math.floor(Math.random() * 20) + 5,
    conversationDepth: Math.floor(Math.random() * 4) + 4,
    dateSuccess: Math.floor(Math.random() * 50) + 20
  };

  // Generate trends
  const trends = [
    {
      direction: overallScore > 60 ? 'up' : 'stable' as 'up' | 'down' | 'stable',
      percentage: Math.floor(Math.random() * 20) + 5,
      metric: 'Algemene activiteit'
    },
    {
      direction: keyMetrics.responseRate > 40 ? 'up' : 'down' as 'up' | 'down' | 'stable',
      percentage: Math.floor(Math.random() * 15) + 3,
      metric: 'Response rate'
    },
    {
      direction: keyMetrics.matchRate > 10 ? 'up' : 'stable' as 'up' | 'down' | 'stable',
      percentage: Math.floor(Math.random() * 25) + 5,
      metric: 'Match kwaliteit'
    }
  ];

  // Generate insights based on metrics
  const insights = [];

  if (overallScore >= 80) {
    insights.push({
      type: 'success' as const,
      title: 'Uitstekende voortgang!',
      description: 'Je bent zeer actief en consistent. Blijf dit niveau vasthouden voor optimale resultaten.',
      actionable: false
    });
  }

  if (keyMetrics.responseRate < 40) {
    insights.push({
      type: 'improvement' as const,
      title: 'Verbeter je openingsberichten',
      description: 'Je response rate is lager dan gemiddeld. Probeer meer persoonlijke en interessante openingsberichten.',
      actionable: true
    });
  }

  if (activityDiversity < 3) {
    insights.push({
      type: 'tip' as const,
      title: 'Gebruik meer tools',
      description: 'Je gebruikt slechts een beperkt aantal tools. Probeer de Profiel Coach en Date Planner voor betere resultaten.',
      actionable: true
    });
  }

  if (keyMetrics.conversationDepth < 6) {
    insights.push({
      type: 'improvement' as const,
      title: 'Diepere gesprekken voeren',
      description: 'Je gesprekken blijven oppervlakkig. Stel meer open vragen om de gesprekken te verdiepen.',
      actionable: true
    });
  }

  // Generate predictions
  const predictions = {
    nextWeekActivity: Math.max(5, Math.floor(totalActivities / 7 * 1.2)),
    expectedMatches: Math.max(1, Math.floor(keyMetrics.matchRate / 10)),
    confidence: Math.floor(Math.random() * 20) + 70
  };

  return {
    overallScore: Math.round(overallScore),
    weeklyProgress,
    keyMetrics,
    trends,
    insights,
    predictions
  };
}