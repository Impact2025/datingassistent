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
  const totalActivities = activities.length;
  const profileActivities = activities.filter(a => a.activity_type === 'profile_analysis').length;
  const chatActivities = activities.filter(a => a.activity_type === 'chat_coach').length;
  const dateActivities = activities.filter(a => a.activity_type === 'date_planner').length;
  const openerActivities = activities.filter(a => a.activity_type === 'opener_generated').length;
  const totalPoints = activities.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0);

  // Weekly progress — deterministic, based on real activity data
  const weeklyProgress = [];
  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const weekActivities = activities.filter(a => {
      const d = new Date(a.created_at);
      return d >= weekStart && d < weekEnd;
    });
    const weekPoints = weekActivities.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0);
    const weekOpeners = weekActivities.filter(a => a.activity_type === 'opener_generated').length;
    const weekChat = weekActivities.filter(a => a.activity_type === 'chat_coach').length;

    weeklyProgress.push({
      week: `Week ${4 - i}`,
      score: Math.min(100, Math.round(20 + weekActivities.length * 12 + weekPoints / 5)),
      activities: weekActivities.length,
      matches: Math.floor(weekOpeners * 0.4),
      conversations: weekChat
    });
  }

  // Overall score — deterministic
  const activityDiversity = [profileActivities, chatActivities, dateActivities, openerActivities].filter(c => c > 0).length;
  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
  const activityFrequency = totalActivities / days;
  const overallScore = Math.min(100, Math.max(0, Math.round(
    activityDiversity * 15 +
    Math.floor(activityFrequency * 40) +
    Math.min(totalActivities * 2, 30)
  )));

  // Key metrics — proxy berekeningen op basis van echte activiteiten
  const keyMetrics = {
    profileViews: profileActivities * 25 + totalActivities * 3,
    messagesSent: openerActivities + chatActivities * 5,
    responseRate: Math.min(80, 20 + profileActivities * 5 + chatActivities * 3),
    matchRate: Math.min(50, 5 + openerActivities * 2),
    conversationDepth: Math.min(10, 3 + chatActivities),
    dateSuccess: Math.min(100, dateActivities * 15 + (totalActivities > 10 ? 20 : 0))
  };

  // Trends — gebaseerd op verschil laatste vs vorige week
  const lastWeek = weeklyProgress[3]?.activities ?? 0;
  const prevWeek = weeklyProgress[2]?.activities ?? 0;
  const activityChange = prevWeek > 0 ? Math.round(Math.abs((lastWeek - prevWeek) / prevWeek) * 100) : 0;

  const trends: SuccessMetrics['trends'] = [
    {
      direction: lastWeek > prevWeek ? 'up' : lastWeek < prevWeek ? 'down' : 'stable',
      percentage: activityChange,
      metric: 'Algemene activiteit'
    },
    {
      direction: keyMetrics.responseRate > 40 ? 'up' : 'stable',
      percentage: Math.max(0, keyMetrics.responseRate - 30),
      metric: 'Response rate'
    },
    {
      direction: keyMetrics.matchRate > 10 ? 'up' : 'stable',
      percentage: keyMetrics.matchRate,
      metric: 'Match kwaliteit'
    }
  ];

  // Insights — gebaseerd op echte scores
  const insights: SuccessMetrics['insights'] = [];

  if (overallScore >= 80) {
    insights.push({
      type: 'success',
      title: 'Uitstekende voortgang!',
      description: 'Je bent zeer actief en consistent. Blijf dit niveau vasthouden voor optimale resultaten.',
      actionable: false
    });
  }

  if (keyMetrics.responseRate < 40) {
    insights.push({
      type: 'improvement',
      title: 'Verbeter je openingsberichten',
      description: 'Je response rate is lager dan gemiddeld. Probeer meer persoonlijke en interessante openingsberichten.',
      actionable: true
    });
  }

  if (activityDiversity < 3) {
    insights.push({
      type: 'tip',
      title: 'Gebruik meer tools',
      description: 'Je gebruikt slechts een beperkt aantal tools. Probeer de Profiel Coach en Date Planner voor betere resultaten.',
      actionable: true
    });
  }

  if (keyMetrics.conversationDepth < 6) {
    insights.push({
      type: 'improvement',
      title: 'Diepere gesprekken voeren',
      description: 'Je gesprekken blijven oppervlakkig. Stel meer open vragen om de gesprekken te verdiepen.',
      actionable: true
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'tip',
      title: 'Blijf actief!',
      description: 'Gebruik DatingAssistent dagelijks om je dating skills te verbeteren en meer resultaten te behalen.',
      actionable: true
    });
  }

  // Predictions — deterministisch
  const weeklyRate = totalActivities / (days / 7);
  const predictions = {
    nextWeekActivity: Math.max(1, Math.round(weeklyRate * 1.1)),
    expectedMatches: Math.max(0, Math.floor(keyMetrics.matchRate / 10)),
    confidence: 75
  };

  return {
    overallScore,
    weeklyProgress,
    keyMetrics,
    trends,
    insights,
    predictions
  };
}