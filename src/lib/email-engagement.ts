/**
 * Email Engagement System voor DatingAssistent
 * Uitgebreide email automation met tracking en personalisatie
 */

import { sql } from '@vercel/postgres';
import { sendEmail } from './email-service';

// ============================================
// TYPES & INTERFACES
// ============================================

export type EmailType =
  // Onboarding (Day 0-14)
  | 'verification'
  | 'welcome'
  | 'profile_optimization_reminder'
  | 'first_win'
  | 'course_introduction'
  | 'weekly_checkin'
  | 'feature_deepdive_chat'
  | 'mid_trial_check'
  // Engagement (Week 2-8)
  | 'course_completion'
  | 'weekly_digest'
  | 'feature_discovery'
  | 'milestone_achievement'
  | 'course_unlock'
  | 'weekly_limit_reminder'
  | 'monthly_progress'
  // Retention (Month 2+)
  | 'inactivity_3days'
  | 'inactivity_7days'
  | 'inactivity_14days'
  | 'exit_survey'
  // Milestones
  | 'dating_success'
  | 'streak_achievement'
  | 'annual_anniversary'
  // Churn Prevention
  | 'subscription_renewal'
  | 'payment_failed'
  | 'downgrade_warning'
  | 'cancellation_intent'
  // Upsell
  | 'feature_limit_reached'
  | 'upgrade_suggestion'
  | 'seasonal_promotion'
  | 'referral_reward'
  // Kickstart → Transformatie Upsell Sequence
  | 'kickstart_upgrade_day7'
  | 'kickstart_upgrade_day14'
  | 'kickstart_upgrade_day21';

export type EmailCategory =
  | 'onboarding'
  | 'engagement'
  | 'retention'
  | 'milestone'
  | 'churn_prevention'
  | 'upsell';

export interface EmailTemplateData {
  firstName: string;
  email: string;
  userId: number;
  subscriptionType: 'sociaal' | 'core' | 'pro' | 'premium';
  [key: string]: any;
}

export interface UserStats {
  aiMessagesUsed: number;
  coursesCompleted: number;
  icebreakersGenerated: number;
  photoAnalyses: number;
  safetyChecks: number;
  loginStreak: number;
  daysActive: number;
}

// ============================================
// EMAIL SCHEDULING FUNCTIONS
// ============================================

/**
 * Schedule welcome email (Day 0 - immediate)
 */
export async function scheduleWelcomeEmail(userId: number): Promise<void> {
  const user = await getUserData(userId);
  if (!user) return;

  await queueEmail(userId, 'welcome', 'onboarding', new Date(), {
    firstName: user.name,
    subscriptionType: user.subscription_type,
    dashboardUrl: `${getBaseUrl()}/dashboard`
  }, 1); // High priority
}

/**
 * Schedule profile optimization reminder (Day 1)
 */
export async function scheduleProfileOptimizationReminder(userId: number): Promise<void> {
  const user = await getUserData(userId);
  if (!user) return;

  // Check if profile is <50% complete
  const profileComplete = await isProfileComplete(userId);
  if (profileComplete) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0); // 10:00 AM

  await queueEmail(userId, 'profile_optimization_reminder', 'onboarding', tomorrow, {
    firstName: user.name,
    completionPercentage: await getProfileCompletionPercentage(userId),
    missingFields: await getMissingProfileFields(userId)
  });
}

/**
 * Schedule weekly check-in (Day 7)
 */
export async function scheduleWeeklyCheckin(userId: number): Promise<void> {
  const user = await getUserData(userId);
  if (!user) return;

  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  weekFromNow.setHours(17, 0, 0, 0); // 5:00 PM Friday

  const stats = await getUserStats(userId);

  await queueEmail(userId, 'weekly_checkin', 'onboarding', weekFromNow, {
    firstName: user.name,
    stats: stats,
    feedbackUrl: `${getBaseUrl()}/feedback`
  });
}

/**
 * Schedule course unlock notification (Every Monday for Sociaal/Core/Pro)
 */
export async function scheduleCourseUnlockNotification(userId: number): Promise<void> {
  const user = await getUserData(userId);
  if (!user || user.subscription_type === 'premium') return; // Premium gets all courses immediately

  const nextMonday = getNextMonday();
  nextMonday.setHours(9, 0, 0, 0); // 9:00 AM

  const newCourses = await getNewlyUnlockedCourses(userId);
  if (newCourses.length === 0) return;

  await queueEmail(userId, 'course_unlock', 'engagement', nextMonday, {
    firstName: user.name,
    courses: newCourses,
    coursesUrl: `${getBaseUrl()}/dashboard?tab=courses`
  });
}

/**
 * Schedule inactivity alerts (3, 7, 14 days)
 */
export async function checkAndScheduleInactivityAlerts(): Promise<void> {
  // Get inactive users
  const inactiveUsers = await sql`
    SELECT
      u.id,
      u.email,
      u.name,
      u.subscription_type,
      NOW() - u.last_login as inactive_duration
    FROM users u
    WHERE
      u.last_login IS NOT NULL
      AND u.last_login < NOW() - INTERVAL '3 days'
      AND NOT EXISTS (
        SELECT 1 FROM email_tracking et
        WHERE et.user_id = u.id
          AND et.email_type IN ('inactivity_3days', 'inactivity_7days', 'inactivity_14days')
          AND et.sent_at > NOW() - INTERVAL '3 days'
      )
  `;

  for (const user of inactiveUsers.rows) {
    const daysSinceLogin = Math.floor(
      (Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24)
    );

    let emailType: EmailType;
    if (daysSinceLogin >= 14) {
      emailType = 'inactivity_14days';
    } else if (daysSinceLogin >= 7) {
      emailType = 'inactivity_7days';
    } else if (daysSinceLogin >= 3) {
      emailType = 'inactivity_3days';
    } else {
      continue;
    }

    await queueEmail(user.id, emailType, 'retention', new Date(), {
      firstName: user.name,
      daysSinceLogin: daysSinceLogin,
      returnUrl: `${getBaseUrl()}/dashboard`
    }, 3); // Medium-high priority
  }
}

/**
 * Schedule weekly digest (Every Monday 8AM)
 */
export async function scheduleWeeklyDigests(): Promise<void> {
  const activeUsers = await sql`
    SELECT u.id, u.email, u.name, u.subscription_type
    FROM users u
    JOIN email_preferences ep ON u.id = ep.user_id
    WHERE
      ep.digest_emails = true
      AND ep.unsubscribed_all = false
      AND u.last_login > NOW() - INTERVAL '30 days'
  `;

  const nextMonday = getNextMonday();
  nextMonday.setHours(8, 0, 0, 0);

  for (const user of activeUsers.rows) {
    const stats = await getUserStats(user.id);
    const newCourses = await getNewlyUnlockedCourses(user.id);

    await queueEmail(user.id, 'weekly_digest', 'engagement', nextMonday, {
      firstName: user.name,
      stats: stats,
      newCourses: newCourses,
      weeklyTip: getWeeklyTip()
    });
  }
}

/**
 * Schedule feature limit reached email (Real-time)
 */
export async function scheduleFeatureLimitReachedEmail(
  userId: number,
  feature: string,
  limit: number
): Promise<void> {
  const user = await getUserData(userId);
  if (!user) return;

  // Don't send if user is already on Premium
  if (user.subscription_type === 'premium') return;

  await queueEmail(userId, 'feature_limit_reached', 'upsell', new Date(), {
    firstName: user.name,
    feature: feature,
    limit: limit,
    currentTier: user.subscription_type,
    upgradeUrl: `${getBaseUrl()}/dashboard/subscription`
  }, 2); // High priority
}

/**
 * Schedule subscription renewal reminder (7 days before)
 */
export async function scheduleSubscriptionRenewalReminders(): Promise<void> {
  const upcomingRenewals = await sql`
    SELECT
      u.id,
      u.email,
      u.name,
      u.subscription_type,
      u.subscription_start_date,
      u.subscription_end_date
    FROM users u
    WHERE
      u.subscription_status = 'active'
      AND u.subscription_end_date IS NOT NULL
      AND u.subscription_end_date - INTERVAL '7 days' <= NOW()
      AND u.subscription_end_date > NOW()
  `;

  for (const user of upcomingRenewals.rows) {
    const renewalDate = new Date(user.subscription_end_date);

    await queueEmail(user.id, 'subscription_renewal', 'churn_prevention', new Date(), {
      firstName: user.name,
      renewalDate: renewalDate.toLocaleDateString('nl-NL'),
      packageType: user.subscription_type,
      manageUrl: `${getBaseUrl()}/dashboard/subscription`
    }, 2);
  }
}

/**
 * Schedule milestone celebration email (Real-time)
 */
export async function scheduleMilestoneCelebration(
  userId: number,
  milestoneType: string,
  milestoneValue: number
): Promise<void> {
  const user = await getUserData(userId);
  if (!user) return;

  // Check if milestone already celebrated
  const existing = await sql`
    SELECT id FROM user_milestones
    WHERE user_id = ${userId}
      AND milestone_type = ${milestoneType}
      AND milestone_value = ${milestoneValue}
  `;

  if (existing.rows.length > 0) return;

  // Record milestone
  await sql`
    INSERT INTO user_milestones (user_id, milestone_type, milestone_value, achieved_at)
    VALUES (${userId}, ${milestoneType}, ${milestoneValue}, NOW())
  `;

  await queueEmail(userId, 'milestone_achievement', 'milestone', new Date(), {
    firstName: user.name,
    milestoneType: milestoneType,
    milestoneValue: milestoneValue,
    badgeUrl: getMilestoneBadgeUrl(milestoneType, milestoneValue)
  }, 2);
}

/**
 * Schedule monthly progress report (Last day of month)
 */
export async function scheduleMonthlyProgressReports(): Promise<void> {
  const activeUsers = await sql`
    SELECT u.id, u.email, u.name, u.subscription_type
    FROM users u
    WHERE u.last_login > NOW() - INTERVAL '60 days'
  `;

  const lastDayOfMonth = getLastDayOfMonth();
  lastDayOfMonth.setHours(20, 0, 0, 0); // 8:00 PM

  for (const user of activeUsers.rows) {
    const monthStats = await getMonthlyStats(user.id);

    await queueEmail(user.id, 'monthly_progress', 'engagement', lastDayOfMonth, {
      firstName: user.name,
      stats: monthStats,
      reportUrl: `${getBaseUrl()}/dashboard/stats`
    });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Queue email for later delivery
 */
async function queueEmail(
  userId: number,
  emailType: EmailType,
  emailCategory: EmailCategory,
  scheduledFor: Date,
  emailData: Record<string, any>,
  priority: number = 5
): Promise<void> {
  try {
    const dedupKey = `${userId}_${emailType}_${scheduledFor.toISOString().split('T')[0]}`;

    await sql`
      INSERT INTO email_queue (
        user_id,
        email_type,
        email_category,
        scheduled_for,
        priority,
        email_data,
        dedup_key
      )
      VALUES (
        ${userId},
        ${emailType},
        ${emailCategory},
        ${scheduledFor.toISOString()},
        ${priority},
        ${JSON.stringify(emailData)}::jsonb,
        ${dedupKey}
      )
      ON CONFLICT (dedup_key) DO NOTHING
    `;
  } catch (error) {
    console.error('Error queueing email:', error);
  }
}

/**
 * Get user data
 */
async function getUserData(userId: number): Promise<any> {
  const result = await sql`
    SELECT id, email, name, subscription_type, last_login
    FROM users
    WHERE id = ${userId}
  `;
  return result.rows[0];
}

/**
 * Get user stats
 */
async function getUserStats(userId: number): Promise<UserStats> {
  const result = await sql`
    SELECT
      COUNT(CASE WHEN feature_type = 'ai_message' THEN 1 END) as ai_messages,
      COUNT(CASE WHEN feature_type = 'icebreaker' THEN 1 END) as icebreakers,
      COUNT(CASE WHEN feature_type = 'photo_check' THEN 1 END) as photo_analyses,
      COUNT(CASE WHEN feature_type = 'safety_check' THEN 1 END) as safety_checks
    FROM usage_tracking
    WHERE user_id = ${userId}
      AND created_at > NOW() - INTERVAL '7 days'
  `;

  const row = result.rows[0];

  return {
    aiMessagesUsed: parseInt(row.ai_messages) || 0,
    coursesCompleted: 0, // TODO: Add courses tracking
    icebreakersGenerated: parseInt(row.icebreakers) || 0,
    photoAnalyses: parseInt(row.photo_analyses) || 0,
    safetyChecks: parseInt(row.safety_checks) || 0,
    loginStreak: 0, // TODO: Add login streak tracking
    daysActive: 0 // TODO: Add days active tracking
  };
}

/**
 * Get monthly stats
 */
async function getMonthlyStats(userId: number): Promise<any> {
  const result = await sql`
    SELECT
      COUNT(CASE WHEN feature_type = 'ai_message' THEN 1 END) as ai_messages,
      COUNT(CASE WHEN feature_type = 'icebreaker' THEN 1 END) as icebreakers,
      COUNT(CASE WHEN feature_type = 'photo_check' THEN 1 END) as photo_analyses,
      COUNT(CASE WHEN feature_type = 'safety_check' THEN 1 END) as safety_checks
    FROM usage_tracking
    WHERE user_id = ${userId}
      AND created_at > NOW() - INTERVAL '30 days'
  `;

  return result.rows[0];
}

/**
 * Check if profile is complete
 */
async function isProfileComplete(userId: number): Promise<boolean> {
  const result = await sql`
    SELECT
      CASE
        WHEN name IS NOT NULL
          AND email IS NOT NULL
          AND profile IS NOT NULL
        THEN true
        ELSE false
      END as is_complete
    FROM users
    WHERE id = ${userId}
  `;

  return result.rows[0]?.is_complete || false;
}

/**
 * Get profile completion percentage
 */
async function getProfileCompletionPercentage(userId: number): Promise<number> {
  // TODO: Implement profile completion calculation
  return 30;
}

/**
 * Get missing profile fields
 */
async function getMissingProfileFields(userId: number): Promise<string[]> {
  // TODO: Implement missing fields detection
  return ['Profielfoto', 'Bio tekst', 'Dating voorkeuren'];
}

/**
 * Get newly unlocked courses
 */
async function getNewlyUnlockedCourses(userId: number): Promise<any[]> {
  // TODO: Implement course unlock logic
  return [];
}

/**
 * Get next Monday
 */
function getNextMonday(): Date {
  const today = new Date();
  const day = today.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysUntilMonday);
  return monday;
}

/**
 * Get last day of current month
 */
function getLastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Get weekly tip
 */
function getWeeklyTip(): string {
  const tips = [
    "Foto's met je huisdier krijgen 32% meer likes",
    "Berichten versturen tussen 19:00-21:00 hebben hoogste response rate",
    "Humor in je bio verhoogt matches met 24%",
    "Vraag open vragen voor betere gesprekken",
    "Update je profiel elke 2 weken voor betere zichtbaarheid"
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Get milestone badge URL
 */
function getMilestoneBadgeUrl(milestoneType: string, value: number): string {
  return `${getBaseUrl()}/images/badges/${milestoneType}_${value}.png`;
}

/**
 * Get base URL
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';
}

// ============================================
// EMAIL CAMPAIGN TRIGGERS
// ============================================

/**
 * Trigger all automation checks (called by cron)
 */
export async function triggerEmailAutomation(): Promise<void> {
  console.log('🤖 Running email automation checks...');

  try {
    await checkAndScheduleInactivityAlerts();
    await scheduleSubscriptionRenewalReminders();
    console.log('✅ Email automation completed successfully');
  } catch (error) {
    console.error('❌ Error in email automation:', error);
  }
}

/**
 * Run weekly email campaigns (Every Monday)
 */
export async function runWeeklyEmailCampaigns(): Promise<void> {
  console.log('📧 Running weekly email campaigns...');

  try {
    await scheduleWeeklyDigests();
    console.log('✅ Weekly email campaigns scheduled');
  } catch (error) {
    console.error('❌ Error scheduling weekly campaigns:', error);
  }
}

/**
 * Run monthly email campaigns (Last day of month)
 */
export async function runMonthlyEmailCampaigns(): Promise<void> {
  console.log('📊 Running monthly email campaigns...');

  try {
    await scheduleMonthlyProgressReports();
    console.log('✅ Monthly email campaigns scheduled');
  } catch (error) {
    console.error('❌ Error scheduling monthly campaigns:', error);
  }
}
