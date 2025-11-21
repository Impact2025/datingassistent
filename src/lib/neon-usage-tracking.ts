import { sql } from '@vercel/postgres';

export interface UsageStats {
  // Weekly (resets every Monday)
  aiMessagesThisWeek: number;
  weekResetDate: string;

  // Rolling 30-day (sliding window)
  profileRewritesLast30Days: number;
  photoChecksLast30Days: number;
  platformAdviceLast30Days: number;

  // Daily (resets at midnight)
  icebreakersToday: number;
  openersToday: number;
  dateIdeasToday: number;
  dateAnalysisToday: number;
  safetyChecksToday: number;
  moduleAiFeedbackToday: number;
  dayResetDate: string;
}

/**
 * Get the start of the current week (Monday 00:00)
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get the start of today (00:00)
 */
function getDayStart(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Get current usage statistics for a user from Neon
 */
export async function getUsageStats(userId: number): Promise<UsageStats> {
  try {
    const weekStart = getWeekStart();
    const dayStart = getDayStart();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await sql`
      SELECT
        -- Weekly (since Monday)
        COALESCE(SUM(CASE WHEN feature_type = 'ai_message' AND created_at >= ${weekStart.toISOString()} THEN 1 ELSE 0 END), 0) as ai_messages_this_week,

        -- Rolling 30-day
        COALESCE(SUM(CASE WHEN feature_type = 'profile_rewrite' AND created_at >= ${thirtyDaysAgo.toISOString()} THEN 1 ELSE 0 END), 0) as profile_rewrites_last_30,
        COALESCE(SUM(CASE WHEN feature_type = 'photo_check' AND created_at >= ${thirtyDaysAgo.toISOString()} THEN 1 ELSE 0 END), 0) as photo_checks_last_30,
        COALESCE(SUM(CASE WHEN feature_type = 'platform_advice' AND created_at >= ${thirtyDaysAgo.toISOString()} THEN 1 ELSE 0 END), 0) as platform_advice_last_30,

        -- Daily (since midnight)
        COALESCE(SUM(CASE WHEN feature_type = 'icebreaker' AND created_at >= ${dayStart.toISOString()} THEN 1 ELSE 0 END), 0) as icebreakers_today,
        COALESCE(SUM(CASE WHEN feature_type = 'opener' AND created_at >= ${dayStart.toISOString()} THEN 1 ELSE 0 END), 0) as openers_today,
        COALESCE(SUM(CASE WHEN feature_type = 'date_idea' AND created_at >= ${dayStart.toISOString()} THEN 1 ELSE 0 END), 0) as date_ideas_today,
        COALESCE(SUM(CASE WHEN feature_type = 'date_analysis' AND created_at >= ${dayStart.toISOString()} THEN 1 ELSE 0 END), 0) as date_analysis_today,
        COALESCE(SUM(CASE WHEN feature_type = 'safety_check' AND created_at >= ${dayStart.toISOString()} THEN 1 ELSE 0 END), 0) as safety_checks_today,
        COALESCE(SUM(CASE WHEN feature_type = 'module_ai' AND created_at >= ${dayStart.toISOString()} THEN 1 ELSE 0 END), 0) as module_ai_today
      FROM usage_tracking
      WHERE user_id = ${userId}
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        aiMessagesThisWeek: parseInt(row.ai_messages_this_week) || 0,
        weekResetDate: weekStart.toISOString(),

        profileRewritesLast30Days: parseInt(row.profile_rewrites_last_30) || 0,
        photoChecksLast30Days: parseInt(row.photo_checks_last_30) || 0,
        platformAdviceLast30Days: parseInt(row.platform_advice_last_30) || 0,

        icebreakersToday: parseInt(row.icebreakers_today) || 0,
        openersToday: parseInt(row.openers_today) || 0,
        dateIdeasToday: parseInt(row.date_ideas_today) || 0,
        dateAnalysisToday: parseInt(row.date_analysis_today) || 0,
        safetyChecksToday: parseInt(row.safety_checks_today) || 0,
        moduleAiFeedbackToday: parseInt(row.module_ai_today) || 0,
        dayResetDate: dayStart.toISOString(),
      };
    }

    // Return default values if no usage yet
    return {
      aiMessagesThisWeek: 0,
      weekResetDate: weekStart.toISOString(),

      profileRewritesLast30Days: 0,
      photoChecksLast30Days: 0,
      platformAdviceLast30Days: 0,

      icebreakersToday: 0,
      openersToday: 0,
      dateIdeasToday: 0,
      dateAnalysisToday: 0,
      safetyChecksToday: 0,
      moduleAiFeedbackToday: 0,
      dayResetDate: dayStart.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    const weekStart = getWeekStart();
    const dayStart = getDayStart();

    // Return default values if error
    return {
      aiMessagesThisWeek: 0,
      weekResetDate: weekStart.toISOString(),

      profileRewritesLast30Days: 0,
      photoChecksLast30Days: 0,
      platformAdviceLast30Days: 0,

      icebreakersToday: 0,
      openersToday: 0,
      dateIdeasToday: 0,
      dateAnalysisToday: 0,
      safetyChecksToday: 0,
      moduleAiFeedbackToday: 0,
      dayResetDate: dayStart.toISOString(),
    };
  }
}

/**
 * Increment AI message usage
 */
export async function incrementAiMessageUsage(userId: number): Promise<void> {
  try {
    await sql`
      INSERT INTO usage_tracking (user_id, feature_type, tokens_used, created_at)
      VALUES (${userId}, 'ai_message', 1, NOW())
    `;
  } catch (error) {
    console.error('Error incrementing AI message usage:', error);
    throw error;
  }
}

/**
 * Increment profile rewrite usage
 */
export async function incrementProfileRewriteUsage(userId: number): Promise<void> {
  try {
    await sql`
      INSERT INTO usage_tracking (user_id, feature_type, tokens_used, created_at)
      VALUES (${userId}, 'profile_rewrite', 1, NOW())
    `;
  } catch (error) {
    console.error('Error incrementing profile rewrite usage:', error);
    throw error;
  }
}

/**
 * Increment photo check usage
 */
export async function incrementPhotoCheckUsage(userId: number): Promise<void> {
  try {
    await sql`
      INSERT INTO usage_tracking (user_id, feature_type, tokens_used, created_at)
      VALUES (${userId}, 'photo_check', 1, NOW())
    `;
  } catch (error) {
    console.error('Error incrementing photo check usage:', error);
    throw error;
  }
}

/**
 * Increment platform advice usage
 */
export async function incrementPlatformAdviceUsage(userId: number): Promise<void> {
  try {
    await sql`
      INSERT INTO usage_tracking (user_id, feature_type, tokens_used, created_at)
      VALUES (${userId}, 'platform_advice', 1, NOW())
    `;
  } catch (error) {
    console.error('Error incrementing platform advice usage:', error);
    throw error;
  }
}

/**
 * Check if user has remaining usage for a feature
 */
export async function hasRemainingUsage(
  userId: number,
  feature: 'aiMessages' | 'profileRewrites' | 'photoChecks' | 'platformAdvice',
  limit: number
): Promise<boolean> {
  const usage = await getUsageStats(userId);

  switch (feature) {
    case 'aiMessages':
      return usage.aiMessagesThisWeek < limit;
    case 'profileRewrites':
      return usage.profileRewritesLast30Days < limit;
    case 'photoChecks':
      return usage.photoChecksLast30Days < limit;
    case 'platformAdvice':
      return usage.platformAdviceLast30Days < limit;
    default:
      return false;
  }
}

/**
 * Get usage statistics for a specific feature
 */
export async function getFeatureUsage(
  userId: number,
  feature: 'ai_message' | 'profile_rewrite' | 'photo_check' | 'platform_advice',
  days: number = 7
): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM usage_tracking
      WHERE user_id = ${userId}
        AND feature_type = ${feature}
        AND created_at >= NOW() - INTERVAL '${days} days'
    `;

    return parseInt(result.rows[0]?.count) || 0;
  } catch (error) {
    console.error('Error fetching feature usage:', error);
    return 0;
  }
}

/**
 * Generic function to track any feature usage
 * Wraps in try-catch so tracking failures don't break the API
 */
export async function trackFeatureUsage(
  userId: number,
  featureType:
    | 'ai_message'
    | 'profile_rewrite'
    | 'photo_check'
    | 'platform_advice'
    | 'icebreaker'
    | 'opener'
    | 'date_idea'
    | 'date_analysis'
    | 'safety_check'
    | 'module_ai'
): Promise<void> {
  try {
    await sql`
      INSERT INTO usage_tracking (user_id, feature_type, tokens_used, created_at)
      VALUES (${userId}, ${featureType}, 1, NOW())
    `;
  } catch (error) {
    console.error(`Failed to track ${featureType} usage:`, error);
    // Don't throw - tracking failures shouldn't break the API
  }
}

/**
 * Check if user has remaining usage for a feature (with new limits)
 */
export async function checkFeatureLimit(
  userId: number,
  featureType:
    | 'ai_message'
    | 'profile_rewrite'
    | 'photo_check'
    | 'platform_advice'
    | 'icebreaker'
    | 'opener'
    | 'date_idea'
    | 'date_analysis'
    | 'safety_check'
    | 'module_ai',
  limit: number
): Promise<{ allowed: boolean; current: number; limit: number; resetDate: string }> {
  try {
    const usage = await getUsageStats(userId);

    let current = 0;
    let resetDate = '';

    // Map feature type to usage stat
    switch (featureType) {
      case 'ai_message':
        current = usage.aiMessagesThisWeek;
        resetDate = usage.weekResetDate;
        break;
      case 'profile_rewrite':
        current = usage.profileRewritesLast30Days;
        resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'photo_check':
        current = usage.photoChecksLast30Days;
        resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'platform_advice':
        current = usage.platformAdviceLast30Days;
        resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'icebreaker':
        current = usage.icebreakersToday;
        resetDate = usage.dayResetDate;
        break;
      case 'opener':
        current = usage.openersToday;
        resetDate = usage.dayResetDate;
        break;
      case 'date_idea':
        current = usage.dateIdeasToday;
        resetDate = usage.dayResetDate;
        break;
      case 'date_analysis':
        current = usage.dateAnalysisToday;
        resetDate = usage.dayResetDate;
        break;
      case 'safety_check':
        current = usage.safetyChecksToday;
        resetDate = usage.dayResetDate;
        break;
      case 'module_ai':
        current = usage.moduleAiFeedbackToday;
        resetDate = usage.dayResetDate;
        break;
    }

    return {
      allowed: current < limit,
      current,
      limit,
      resetDate
    };
  } catch (error) {
    console.error('Error checking feature limit:', error);
    // Allow on error to prevent blocking users
    return {
      allowed: true,
      current: 0,
      limit,
      resetDate: new Date().toISOString()
    };
  }
}
