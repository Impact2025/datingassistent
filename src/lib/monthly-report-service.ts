/**
 * Monthly Report Service
 * Generates comprehensive monthly progress reports with AI insights
 */

import { sql } from '@vercel/postgres';
import { openRouter, OPENROUTER_MODELS } from './openrouter';

export interface MonthlyMetrics {
  userId: number;
  monthNumber: number;
  year: number;
  reportDate: string;

  // Dating metrics
  totalMatches: number;
  qualityMatches: number;
  totalConversations: number;
  meaningfulConversations: number;
  totalDates: number;
  secondDates: number;

  // Engagement metrics
  daysActive: number;
  totalDaysInMonth: number;
  consistencyScore: number;
  longestStreak: number;

  // Activity metrics
  profileUpdates: number;
  photosUpdated: number;
  bioUpdates: number;
  messagesAnalyzed: number;
  coachingSessions: number;

  // Progress metrics
  tasksCompleted: number;
  totalTasks: number;
  checkinsCompleted: number;
  goalsAchieved: number;
  totalGoals: number;

  // Points & achievements
  pointsEarned: number;
  badgesEarned: number;
  milestonesReached: number;

  // Qualitative data
  topWins: string[];
  biggestChallenges: string[];
  lessonsLearned: string[];
}

export interface MonthlyInsights {
  overallProgress: number; // 0-100
  strengthAreas: string[];
  improvementAreas: string[];
  personalizedTips: string[];
  aiSummary: string;
  nextMonthFocus: string[];
  motivationalMessage: string;
}

export interface MonthlyReport {
  metrics: MonthlyMetrics;
  insights: MonthlyInsights;
  comparison: {
    vsLastMonth?: {
      matchesChange: number;
      datesChange: number;
      consistencyChange: number;
    };
    vsAverage?: {
      matchesVsAvg: number;
      datesVsAvg: number;
    };
  };
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
}

/**
 * Generate monthly report for a user
 */
export async function generateMonthlyReport(
  userId: number,
  month: number,
  year: number
): Promise<MonthlyReport> {
  try {
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Gather metrics from various sources
    const [
      engagementData,
      tasksData,
      checkinsData,
      actionsData,
      badgesData,
      goalsData
    ] = await Promise.all([
      getEngagementMetrics(userId, startDateStr, endDateStr),
      getTaskMetrics(userId, startDateStr, endDateStr),
      getCheckinMetrics(userId, startDateStr, endDateStr),
      getUserActions(userId, startDateStr, endDateStr),
      getBadgesEarned(userId, startDateStr, endDateStr),
      getGoalsProgress(userId, startDateStr, endDateStr)
    ]);

    // Compile metrics
    const metrics: MonthlyMetrics = {
      userId,
      monthNumber: month,
      year,
      reportDate: new Date().toISOString().split('T')[0],

      // Dating metrics - get from dating activity logs or default to 0
      ...await getDatingMetrics(userId, startDateStr, endDateStr),

      // Engagement metrics
      daysActive: engagementData.daysActive,
      totalDaysInMonth: endDate.getDate(),
      consistencyScore: engagementData.consistencyScore,
      longestStreak: engagementData.longestStreak,

      // Activity metrics
      profileUpdates: actionsData.profileUpdates,
      photosUpdated: actionsData.photosUpdated,
      bioUpdates: actionsData.bioUpdates,
      messagesAnalyzed: actionsData.messagesAnalyzed,
      coachingSessions: actionsData.coachingSessions,

      // Progress metrics
      tasksCompleted: tasksData.completed,
      totalTasks: tasksData.total,
      checkinsCompleted: checkinsData.total,
      goalsAchieved: goalsData.achieved,
      totalGoals: goalsData.total,

      // Points & achievements
      pointsEarned: actionsData.totalPoints,
      badgesEarned: badgesData.count,
      milestonesReached: actionsData.milestones,

      // Qualitative
      topWins: checkinsData.wins,
      biggestChallenges: checkinsData.challenges,
      lessonsLearned: []
    };

    // Generate AI insights
    const insights = await generateAIInsights(metrics);

    // Get achievements for this month
    const achievements = await getMonthAchievements(userId, startDateStr, endDateStr);

    // Calculate comparisons
    const comparison = await calculateComparisons(userId, metrics, month, year);

    // Save report to database
    await saveMonthlyReport(userId, month, year, metrics, insights);

    return {
      metrics,
      insights,
      comparison,
      achievements
    };

  } catch (error) {
    console.error('Failed to generate monthly report:', error);
    throw error;
  }
}

/**
 * Get engagement metrics for the month
 */
async function getEngagementMetrics(userId: number, startDate: string, endDate: string) {
  const result = await sql`
    SELECT
      COUNT(DISTINCT DATE(last_activity_date)) as days_active,
      MAX(longest_streak) as longest_streak,
      MAX(current_streak) as current_streak
    FROM user_engagement
    WHERE user_id = ${userId}
  `;

  const daysActive = result.rows[0]?.days_active || 0;
  const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  const consistencyScore = totalDays > 0 ? Math.round((daysActive / totalDays) * 100) : 0;

  return {
    daysActive,
    longestStreak: result.rows[0]?.longest_streak || 0,
    currentStreak: result.rows[0]?.current_streak || 0,
    consistencyScore
  };
}

/**
 * Get task completion metrics
 */
async function getTaskMetrics(userId: number, startDate: string, endDate: string) {
  const result = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'skipped' THEN 1 END) as skipped
    FROM daily_tasks
    WHERE user_id = ${userId}
    AND task_date BETWEEN ${startDate} AND ${endDate}
  `;

  return {
    total: result.rows[0]?.total || 0,
    completed: result.rows[0]?.completed || 0,
    skipped: result.rows[0]?.skipped || 0
  };
}

/**
 * Get check-in data
 */
async function getCheckinMetrics(userId: number, startDate: string, endDate: string) {
  const result = await sql`
    SELECT
      COUNT(*) as total,
      AVG(mood_rating) as avg_mood,
      AVG(progress_rating) as avg_progress,
      ARRAY_AGG(wins) FILTER (WHERE wins IS NOT NULL) as wins,
      ARRAY_AGG(challenges) FILTER (WHERE challenges IS NOT NULL) as challenges
    FROM daily_checkins
    WHERE user_id = ${userId}
    AND checkin_date BETWEEN ${startDate} AND ${endDate}
  `;

  return {
    total: result.rows[0]?.total || 0,
    avgMood: result.rows[0]?.avg_mood || 0,
    avgProgress: result.rows[0]?.avg_progress || 0,
    wins: (result.rows[0]?.wins || []).filter(Boolean).slice(0, 3),
    challenges: (result.rows[0]?.challenges || []).filter(Boolean).slice(0, 3)
  };
}

/**
 * Get user actions and points
 */
async function getUserActions(userId: number, startDate: string, endDate: string) {
  const result = await sql`
    SELECT
      SUM(points_earned) as total_points,
      COUNT(CASE WHEN action_type = 'profile_update' THEN 1 END) as profile_updates,
      COUNT(CASE WHEN action_type = 'photo_update' THEN 1 END) as photos_updated,
      COUNT(CASE WHEN action_type = 'bio_update' THEN 1 END) as bio_updates,
      COUNT(CASE WHEN action_type = 'message_analyzed' THEN 1 END) as messages_analyzed,
      COUNT(CASE WHEN action_type = 'coaching_session' THEN 1 END) as coaching_sessions,
      COUNT(CASE WHEN action_category = 'milestone' THEN 1 END) as milestones
    FROM user_actions
    WHERE user_id = ${userId}
    AND created_at BETWEEN ${startDate} AND ${endDate}
  `;

  return {
    totalPoints: result.rows[0]?.total_points || 0,
    profileUpdates: result.rows[0]?.profile_updates || 0,
    photosUpdated: result.rows[0]?.photos_updated || 0,
    bioUpdates: result.rows[0]?.bio_updates || 0,
    messagesAnalyzed: result.rows[0]?.messages_analyzed || 0,
    coachingSessions: result.rows[0]?.coaching_sessions || 0,
    milestones: result.rows[0]?.milestones || 0
  };
}

/**
 * Get badges earned this month
 */
async function getBadgesEarned(userId: number, startDate: string, endDate: string) {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM user_badges
    WHERE user_id = ${userId}
    AND earned_at BETWEEN ${startDate} AND ${endDate}
  `;

  return {
    count: result.rows[0]?.count || 0
  };
}

/**
 * Get goals progress
 */
async function getGoalsProgress(userId: number, startDate: string, endDate: string) {
  const result = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as achieved
    FROM user_goals
    WHERE user_id = ${userId}
    AND created_at <= ${endDate}
  `;

  return {
    total: result.rows[0]?.total || 0,
    achieved: result.rows[0]?.achieved || 0
  };
}

/**
 * Get dating metrics from user activity logs
 */
async function getDatingMetrics(userId: number, startDate: string, endDate: string) {
  try {
    const result = await sql`
      SELECT
        COUNT(CASE WHEN activity_type = 'match' THEN 1 END) as total_matches,
        COUNT(CASE WHEN activity_type = 'match' AND match_quality >= 7 THEN 1 END) as quality_matches,
        COUNT(CASE WHEN activity_type = 'conversation' THEN 1 END) as total_conversations,
        COUNT(CASE WHEN activity_type = 'conversation' AND was_meaningful = true THEN 1 END) as meaningful_conversations,
        COUNT(CASE WHEN activity_type = 'date' THEN 1 END) as total_dates,
        COUNT(CASE WHEN activity_type = 'second_date' THEN 1 END) as second_dates
      FROM dating_activities
      WHERE user_id = ${userId}
      AND activity_date BETWEEN ${startDate} AND ${endDate}
    `;

    return {
      totalMatches: result.rows[0]?.total_matches || 0,
      qualityMatches: result.rows[0]?.quality_matches || 0,
      totalConversations: result.rows[0]?.total_conversations || 0,
      meaningfulConversations: result.rows[0]?.meaningful_conversations || 0,
      totalDates: result.rows[0]?.total_dates || 0,
      secondDates: result.rows[0]?.second_dates || 0
    };
  } catch (error) {
    // If table doesn't exist yet, return zeros
    console.warn('Dating activities table not available, using default values');
    return {
      totalMatches: 0,
      qualityMatches: 0,
      totalConversations: 0,
      meaningfulConversations: 0,
      totalDates: 0,
      secondDates: 0
    };
  }
}

/**
 * Generate AI insights based on metrics
 */
async function generateAIInsights(metrics: MonthlyMetrics): Promise<MonthlyInsights> {
  const prompt = `Je bent een dating coach AI. Analyseer deze maandelijkse metrics en genereer persoonlijke insights:

Engagement:
- ${metrics.daysActive}/${metrics.totalDaysInMonth} dagen actief (${metrics.consistencyScore}% consistentie)
- Langste streak: ${metrics.longestStreak} dagen

Dating Performance:
- ${metrics.totalMatches} matches (${metrics.qualityMatches} kwaliteit matches)
- ${metrics.totalConversations} gesprekken (${metrics.meaningfulConversations} betekenisvol)
- ${metrics.totalDates} dates (${metrics.secondDates} tweede dates)

Activiteit:
- ${metrics.tasksCompleted}/${metrics.totalTasks} taken voltooid
- ${metrics.checkinsCompleted} check-ins gedaan
- ${metrics.goalsAchieved}/${metrics.totalGoals} doelen behaald

Top Wins: ${metrics.topWins.join(', ')}
Challenges: ${metrics.biggestChallenges.join(', ')}

Geef terug in JSON format:
{
  "overallProgress": <0-100 score>,
  "strengthAreas": [<3 sterke punten>],
  "improvementAreas": [<3 verbeterpunten>],
  "personalizedTips": [<5 concrete tips>],
  "aiSummary": "<samenvattende analyse in 2-3 zinnen>",
  "nextMonthFocus": [<3 focus gebieden voor volgende maand>],
  "motivationalMessage": "<motiverende boodschap>"
}`;

  try {
    const response = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        temperature: 0.7,
        max_tokens: 1500
      }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to generate AI insights:', error);
  }

  // Fallback insights
  return {
    overallProgress: Math.round((metrics.consistencyScore + (metrics.tasksCompleted / metrics.totalTasks * 100)) / 2),
    strengthAreas: ['Consistente activiteit', 'Proactief profiel verbeteren', 'Goede check-in discipline'],
    improvementAreas: ['Meer kwaliteit gesprekken', 'Sneller naar dates omzetten', 'Langere streaks'],
    personalizedTips: [
      'Reageer binnen 24 uur op matches voor betere conversies',
      'Plan dates binnen 1 week na goed gesprek',
      'Update je bio elke 2 weken met nieuwe interesses',
      'Analyseer gesprekken die doodlopen met AI Coach',
      'Gebruik openers die refereren aan hun profiel'
    ],
    aiSummary: `Goede vooruitgang met ${metrics.consistencyScore}% consistentie. Je hebt ${metrics.totalDates} dates gehad deze maand. Focus op het omzetten van gesprekken naar dates.`,
    nextMonthFocus: ['Verhoog date conversie rate', 'Verbeter gesprekskwaliteit', 'Langere engagement streak'],
    motivationalMessage: 'Je bent op de goede weg! Blijf consistent en de resultaten komen vanzelf.'
  };
}

/**
 * Get achievements earned this month
 */
async function getMonthAchievements(userId: number, startDate: string, endDate: string) {
  const result = await sql`
    SELECT
      b.badge_name as title,
      b.badge_description as description,
      b.badge_icon as icon,
      b.earned_at
    FROM user_badges b
    WHERE b.user_id = ${userId}
    AND b.earned_at BETWEEN ${startDate} AND ${endDate}
    ORDER BY b.earned_at DESC
  `;

  return result.rows.map(row => ({
    title: row.title,
    description: row.description,
    icon: row.icon,
    earnedAt: row.earned_at
  }));
}

/**
 * Calculate month-over-month comparisons
 */
async function calculateComparisons(
  userId: number,
  currentMetrics: MonthlyMetrics,
  month: number,
  year: number
) {
  // Get last month's report
  let lastMonth = month - 1;
  let lastYear = year;
  if (lastMonth === 0) {
    lastMonth = 12;
    lastYear = year - 1;
  }

  const lastMonthReport = await sql`
    SELECT metrics_data
    FROM monthly_reports
    WHERE user_id = ${userId}
    AND month_number = ${lastMonth}
    AND year = ${lastYear}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const comparison: any = {};

  if (lastMonthReport.rows.length > 0) {
    const lastMetrics = lastMonthReport.rows[0].metrics_data;
    comparison.vsLastMonth = {
      matchesChange: ((currentMetrics.totalMatches - lastMetrics.totalMatches) / lastMetrics.totalMatches * 100),
      datesChange: ((currentMetrics.totalDates - lastMetrics.totalDates) / lastMetrics.totalDates * 100),
      consistencyChange: currentMetrics.consistencyScore - lastMetrics.consistencyScore
    };
  }

  return comparison;
}

/**
 * Save monthly report to database
 */
async function saveMonthlyReport(
  userId: number,
  month: number,
  year: number,
  metrics: MonthlyMetrics,
  insights: MonthlyInsights
) {
  await sql`
    INSERT INTO monthly_reports (
      user_id,
      month_number,
      year,
      report_date,
      metrics_data,
      insights_data,
      overall_score
    ) VALUES (
      ${userId},
      ${month},
      ${year},
      CURRENT_DATE,
      ${JSON.stringify(metrics)},
      ${JSON.stringify(insights)},
      ${insights.overallProgress}
    )
    ON CONFLICT (user_id, month_number, year)
    DO UPDATE SET
      metrics_data = ${JSON.stringify(metrics)},
      insights_data = ${JSON.stringify(insights)},
      overall_score = ${insights.overallProgress},
      updated_at = NOW()
  `;
}

/**
 * Get all monthly reports for a user
 */
export async function getUserMonthlyReports(userId: number) {
  const result = await sql`
    SELECT *
    FROM monthly_reports
    WHERE user_id = ${userId}
    ORDER BY year DESC, month_number DESC
    LIMIT 12
  `;

  return result.rows;
}
