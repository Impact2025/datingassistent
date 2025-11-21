import { sql } from '@vercel/postgres';

// Types for progress tracking
export interface ActivityData {
  type: string;
  data?: Record<string, any>;
  points?: number;
}

export interface ProgressMetrics {
  profileScore: number;
  conversationQuality: number;
  consistency: number;
  overallScore: number;
  weekStart: Date;
}

export interface WeeklyInsight {
  id: number;
  type: 'improvement' | 'celebration' | 'warning' | 'tip';
  title: string;
  description: string;
  actionable: boolean;
  priority: number;
}

export interface UserBadge {
  id: number;
  type: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

// Activity tracking functions
export async function trackUserActivity(userId: number, activity: ActivityData) {
  try {
    const pointsEarned = activity.points || getDefaultPointsForActivity(activity.type);

    await sql`
      INSERT INTO user_activity_log (user_id, activity_type, activity_data, points_earned)
      VALUES (${userId}, ${activity.type}, ${JSON.stringify(activity.data || {})}, ${pointsEarned})
    `;

    // Update streaks
    await updateUserStreak(userId, activity.type);

    // Check for badge unlocks
    await checkAndAwardBadges(userId);

    return { success: true, pointsEarned };
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return { success: false, error };
  }
}

// Get default points for different activity types
function getDefaultPointsForActivity(activityType: string): number {
  const pointsMap: Record<string, number> = {
    'profile_analysis': 15,
    'chat_coach': 5,
    'profile_coach': 10,
    'photo_upload': 8,
    'opener_lab': 7,
    'date_planner': 6,
    'login': 1,
    'dashboard_visit': 2
  };

  return pointsMap[activityType] || 1;
}

// Update user streaks
async function updateUserStreak(userId: number, activityType: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Update daily activity streak
    await sql`
      INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
      VALUES (${userId}, 'daily_activity', 1, 1, ${today})
      ON CONFLICT (user_id, streak_type)
      DO UPDATE SET
        current_streak = CASE
          WHEN user_streaks.last_activity_date = ${today}::date - INTERVAL '1 day'
          THEN user_streaks.current_streak + 1
          WHEN user_streaks.last_activity_date = ${today}::date
          THEN user_streaks.current_streak
          ELSE 1
        END,
        longest_streak = GREATEST(user_streaks.longest_streak, CASE
          WHEN user_streaks.last_activity_date = ${today}::date - INTERVAL '1 day'
          THEN user_streaks.current_streak + 1
          WHEN user_streaks.last_activity_date = ${today}::date
          THEN user_streaks.current_streak
          ELSE 1
        END),
        last_activity_date = ${today}::date,
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error updating user streak:', error);
  }
}

// Check and award badges
async function checkAndAwardBadges(userId: number) {
  try {
    // Get user's activity stats
    const activityStats = await sql`
      SELECT
        COUNT(*) as total_activities,
        COUNT(CASE WHEN activity_type = 'profile_analysis' THEN 1 END) as profile_analyses,
        COUNT(CASE WHEN activity_type = 'chat_coach' THEN 1 END) as chat_sessions,
        COUNT(CASE WHEN activity_type = 'photo_upload' THEN 1 END) as photo_uploads,
        SUM(points_earned) as total_points
      FROM user_activity_log
      WHERE user_id = ${userId}
    `;

    const stats = activityStats.rows[0];

    // Define badge conditions
    const badgesToCheck = [
      {
        type: 'first_steps',
        name: 'Eerste Stap',
        description: 'Voltooi je eerste activiteit',
        icon: '🎯',
        condition: stats.total_activities >= 1
      },
      {
        type: 'profile_explorer',
        name: 'Profiel Verkenner',
        description: 'Voer 5 profiel analyses uit',
        icon: '🔍',
        condition: stats.profile_analyses >= 5
      },
      {
        type: 'chat_champion',
        name: 'Chat Kampioen',
        description: 'Gebruik de chat coach 10 keer',
        icon: '💬',
        condition: stats.chat_sessions >= 10
      },
      {
        type: 'photo_pro',
        name: 'Foto Professional',
        description: 'Upload 5 profielfoto\'s',
        icon: '📸',
        condition: stats.photo_uploads >= 5
      },
      {
        type: 'dedicated_learner',
        name: 'Toegewijde Leerling',
        description: 'Verdien 100 punten',
        icon: '🎓',
        condition: stats.total_points >= 100
      }
    ];

    // Check each badge
    for (const badge of badgesToCheck) {
      if (badge.condition) {
        // Check if user already has this badge
        const existingBadge = await sql`
          SELECT id FROM user_badges
          WHERE user_id = ${userId} AND badge_type = ${badge.type}
        `;

        if (existingBadge.rows.length === 0) {
          // Award the badge
          await sql`
            INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
            VALUES (${userId}, ${badge.type}, ${badge.name}, ${badge.description}, ${badge.icon})
          `;

          console.log(`🏆 Badge awarded to user ${userId}: ${badge.name}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

// Get user progress metrics for current week
export async function getCurrentWeekProgress(userId: number): Promise<ProgressMetrics | null> {
  try {
    const weekStart = getWeekStart();

    const metrics = await sql`
      SELECT metric_type, metric_value
      FROM user_progress_metrics
      WHERE user_id = ${userId} AND week_start = ${weekStart.toISOString().split('T')[0]}
    `;

    if (metrics.rows.length === 0) {
      // Return default metrics if no data exists
      return {
        profileScore: 0,
        conversationQuality: 0,
        consistency: 0,
        overallScore: 0,
        weekStart
      };
    }

    const metricsMap = metrics.rows.reduce((acc, row) => {
      acc[row.metric_type] = parseFloat(row.metric_value);
      return acc;
    }, {} as Record<string, number>);

    return {
      profileScore: metricsMap.profile_score || 0,
      conversationQuality: metricsMap.conversation_quality || 0,
      consistency: metricsMap.consistency || 0,
      overallScore: metricsMap.overall || 0,
      weekStart
    };
  } catch (error) {
    console.error('Error getting current week progress:', error);
    return null;
  }
}

// Get weekly insights
export async function getWeeklyInsights(userId: number): Promise<WeeklyInsight[]> {
  try {
    const weekStart = getWeekStart();

    const insights = await sql`
      SELECT id, insight_type, title, description, actionable, priority
      FROM weekly_insights
      WHERE user_id = ${userId} AND week_start = ${weekStart.toISOString().split('T')[0]}
      ORDER BY priority DESC, created_at DESC
    `;

    return insights.rows.map(row => ({
      id: row.id,
      type: row.insight_type,
      title: row.title,
      description: row.description,
      actionable: row.actionable,
      priority: row.priority
    }));
  } catch (error) {
    console.error('Error getting weekly insights:', error);
    return [];
  }
}

// Get user badges
export async function getUserBadges(userId: number): Promise<UserBadge[]> {
  try {
    const badges = await sql`
      SELECT id, badge_type, badge_name, badge_description, badge_icon, earned_at
      FROM user_badges
      WHERE user_id = ${userId}
      ORDER BY earned_at DESC
    `;

    return badges.rows.map(row => ({
      id: row.id,
      type: row.badge_type,
      name: row.badge_name,
      description: row.badge_description,
      icon: row.badge_icon,
      earnedAt: new Date(row.earned_at)
    }));
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

// Calculate and update weekly metrics
export async function calculateWeeklyMetrics(userId: number) {
  try {
    const weekStart = getWeekStart();

    // Get activity data for the week
    const activities = await sql`
      SELECT activity_type, activity_data, points_earned, created_at
      FROM user_activity_log
      WHERE user_id = ${userId}
      AND created_at >= ${weekStart.toISOString()}
      ORDER BY created_at DESC
    `;

    // Calculate metrics
    const metrics = calculateMetricsFromActivities(activities.rows);

    // Store metrics
    for (const [metricType, value] of Object.entries(metrics)) {
      await sql`
        INSERT INTO user_progress_metrics (user_id, metric_type, metric_value, week_start)
        VALUES (${userId}, ${metricType}, ${value}, ${weekStart.toISOString().split('T')[0]})
        ON CONFLICT (user_id, metric_type, week_start)
        DO UPDATE SET metric_value = ${value}, updated_at = NOW()
      `;
    }

    return metrics;
  } catch (error) {
    console.error('Error calculating weekly metrics:', error);
    return null;
  }
}

// Calculate metrics from activity data
function calculateMetricsFromActivities(activities: any[]): Record<string, number> {
  let profileScore = 0;
  let conversationQuality = 0;
  let consistency = 0;

  // Count different activity types
  const activityCounts = activities.reduce((acc, activity) => {
    acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate profile score (based on profile analysis and coach usage)
  const profileActivities = (activityCounts.profile_analysis || 0) + (activityCounts.profile_coach || 0);
  profileScore = Math.min(100, profileActivities * 15); // Max 100 at ~7 activities

  // Calculate conversation quality (based on chat coach and opener usage)
  const conversationActivities = (activityCounts.chat_coach || 0) + (activityCounts.opener_lab || 0);
  conversationQuality = Math.min(100, conversationActivities * 8); // Max 100 at ~12 activities

  // Calculate consistency (based on unique days active this week)
  const uniqueDays = new Set(
    activities.map(a => new Date(a.created_at).toDateString())
  ).size;
  consistency = Math.min(100, uniqueDays * 20); // Max 100 at 5+ active days

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (profileScore * 0.4) + (conversationQuality * 0.4) + (consistency * 0.2)
  );

  return {
    profile_score: Math.round(profileScore),
    conversation_quality: Math.round(conversationQuality),
    consistency: Math.round(consistency),
    overall: overallScore
  };
}

// Utility function to get week start (Monday)
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}

// Generate weekly insights based on progress
export async function generateWeeklyInsights(userId: number) {
  try {
    const currentMetrics = await getCurrentWeekProgress(userId);
    if (!currentMetrics) return;

    const insights: Array<{
      type: string;
      title: string;
      description: string;
      actionable: boolean;
      priority: number;
    }> = [];

    // Profile score insights
    if (currentMetrics.profileScore >= 80) {
      insights.push({
        type: 'celebration',
        title: 'Profiel Uitstekend! 🌟',
        description: `Je profielscore van ${currentMetrics.profileScore} is uitstekend. Je straalt zelfvertrouwen uit!`,
        actionable: false,
        priority: 3
      });
    } else if (currentMetrics.profileScore < 50) {
      insights.push({
        type: 'improvement',
        title: 'Profiel Verbetering Nodig',
        description: 'Je profiel kan nog wat aandacht gebruiken. Probeer de Profiel Coach voor tips.',
        actionable: true,
        priority: 2
      });
    }

    // Consistency insights
    if (currentMetrics.consistency >= 80) {
      insights.push({
        type: 'celebration',
        title: 'Super Consistent! 🔥',
        description: 'Je bent deze week heel actief geweest. Geweldig werk!',
        actionable: false,
        priority: 2
      });
    } else if (currentMetrics.consistency < 40) {
      insights.push({
        type: 'tip',
        title: 'Meer Consistentie',
        description: 'Probeer elke dag iets te doen voor je dating skills. Kleine stapjes leiden tot grote verbeteringen.',
        actionable: true,
        priority: 1
      });
    }

    // Conversation quality insights
    if (currentMetrics.conversationQuality < 60) {
      insights.push({
        type: 'improvement',
        title: 'Gesprekstechnieken Verbeteren',
        description: 'Je gesprekken kunnen nog wat verfijning gebruiken. De Chat Coach helpt hierbij.',
        actionable: true,
        priority: 2
      });
    }

    // Store insights in database
    const weekStart = getWeekStart();
    for (const insight of insights) {
      await sql`
        INSERT INTO weekly_insights (user_id, week_start, insight_type, title, description, actionable, priority)
        VALUES (${userId}, ${weekStart.toISOString().split('T')[0]}, ${insight.type}, ${insight.title}, ${insight.description}, ${insight.actionable}, ${insight.priority})
      `;
    }

    return insights;
  } catch (error) {
    console.error('Error generating weekly insights:', error);
    return [];
  }
}