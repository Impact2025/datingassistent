import { sql } from '@vercel/postgres';

export type PackageType = 'sociaal' | 'core' | 'pro' | 'premium' | 'kickstart' | 'transformatie' | 'vip';

export interface SubscriptionFeatures {
  // WEEKLY LIMITS (reset elke maandag 00:00)
  aiMessagesPerWeek: number;

  // ROLLING 30-DAY LIMITS (sliding window)
  profileRewritesRolling30Days: number;
  photoChecksRolling30Days: number;
  platformAdviceRolling30Days: number;

  // DAILY SOFT LIMITS (reset dagelijks 00:00)
  icebreakersPerDay: number;
  openersPerDay: number;
  dateIdeasPerDay: number;
  dateAnalysisPerDay: number;
  safetyChecksPerDay: number;
  moduleAiFeedbackPerDay: number;

  // COURSE ACCESS (progressive unlock systeem)
  courseUnlockSchedule: 'weekly' | 'immediate';
  weeklyNewCourses: number;
  totalCoursesAccess: number;

  // BOOLEAN FEATURES
  hasReactionAssistant: boolean;
  hasPrioritySupport: boolean;
  hasLiveCoach: boolean;
  hasVipSupport: boolean;
}

export const PACKAGE_FEATURES: Record<PackageType, SubscriptionFeatures> = {
  sociaal: {
    // Weekly limits
    aiMessagesPerWeek: 25,

    // Rolling 30-day limits
    profileRewritesRolling30Days: 2,
    photoChecksRolling30Days: 5,
    platformAdviceRolling30Days: 2,

    // Daily soft limits
    icebreakersPerDay: 10,
    openersPerDay: 10,
    dateIdeasPerDay: 5,
    dateAnalysisPerDay: 3,
    safetyChecksPerDay: 5,
    moduleAiFeedbackPerDay: 15,

    // Course access - Basis cursussen only
    courseUnlockSchedule: 'weekly',
    weeklyNewCourses: 1,
    totalCoursesAccess: 8,

    // Features
    hasReactionAssistant: false,
    hasPrioritySupport: false,
    hasLiveCoach: false,
    hasVipSupport: false,
  },
  core: {
    // Weekly limits
    aiMessagesPerWeek: 60,

    // Rolling 30-day limits
    profileRewritesRolling30Days: 4,
    photoChecksRolling30Days: 12,
    platformAdviceRolling30Days: 4,

    // Daily soft limits
    icebreakersPerDay: 20,
    openersPerDay: 20,
    dateIdeasPerDay: 10,
    dateAnalysisPerDay: 8,
    safetyChecksPerDay: 10,
    moduleAiFeedbackPerDay: 30,

    // Course access - VERBETERD: 1/week voor langere binding
    courseUnlockSchedule: 'weekly',
    weeklyNewCourses: 1,  // Was: 2, nu: 1 voor dubbele LTV
    totalCoursesAccess: 999,  // Was: 20, nu: unlimited

    // Features
    hasReactionAssistant: true,
    hasPrioritySupport: false,
    hasLiveCoach: false,
    hasVipSupport: false,
  },
  pro: {
    // Weekly limits
    aiMessagesPerWeek: 125,

    // Rolling 30-day limits
    profileRewritesRolling30Days: 8,
    photoChecksRolling30Days: 25,
    platformAdviceRolling30Days: 8,

    // Daily soft limits
    icebreakersPerDay: 40,
    openersPerDay: 40,
    dateIdeasPerDay: 20,
    dateAnalysisPerDay: 15,
    safetyChecksPerDay: 20,
    moduleAiFeedbackPerDay: 50,

    // Course access - VERBETERD: 2/week voor betere balans
    courseUnlockSchedule: 'weekly',
    weeklyNewCourses: 2,  // Was: 3, nu: 2 voor langere binding
    totalCoursesAccess: 999,

    // Features
    hasReactionAssistant: true,
    hasPrioritySupport: true,
    hasLiveCoach: false,
    hasVipSupport: false,
  },
  premium: {
    // Weekly limits
    aiMessagesPerWeek: 250,

    // Rolling 30-day limits
    profileRewritesRolling30Days: 15,
    photoChecksRolling30Days: 50,
    platformAdviceRolling30Days: 15,

    // Daily soft limits
    icebreakersPerDay: 100,
    openersPerDay: 100,
    dateIdeasPerDay: 50,
    dateAnalysisPerDay: 30,
    safetyChecksPerDay: 50,
    moduleAiFeedbackPerDay: 100,

    // Course access
    courseUnlockSchedule: 'immediate',
    weeklyNewCourses: 0,
    totalCoursesAccess: 999,

    // Features
    hasReactionAssistant: true,
    hasPrioritySupport: true,
    hasLiveCoach: true,
    hasVipSupport: true,
  },
};

export interface UserSubscription {
  packageType: PackageType;
  billingPeriod: 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  orderId: string;
  startDate: string;
  amount: number;
}

/**
 * Get user subscription from Neon database
 */
export async function getUserSubscription(userId: number): Promise<UserSubscription | null> {
  try {
    const result = await sql`
      SELECT subscription
      FROM users
      WHERE id = ${userId}
    `;

    if (result.rows.length === 0 || !result.rows[0].subscription) {
      return null;
    }

    return result.rows[0].subscription as UserSubscription;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: number,
  feature: keyof SubscriptionFeatures
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  const features = PACKAGE_FEATURES[subscription.packageType];
  const featureValue = features[feature];

  // Boolean features
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }

  // Numeric features - check if > 0
  if (typeof featureValue === 'number') {
    return featureValue > 0;
  }

  // String features (courseUnlockSchedule)
  return false;
}

/**
 * Get user's feature limits
 */
export async function getFeatureLimits(userId: number): Promise<SubscriptionFeatures | null> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.status !== 'active') {
    return null;
  }

  return PACKAGE_FEATURES[subscription.packageType];
}

/**
 * Check if subscription is active
 */
export async function hasActiveSubscription(userId: number): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription !== null && subscription.status === 'active';
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  userId: number,
  status: 'active' | 'paused' | 'cancelled' | 'expired'
): Promise<void> {
  try {
    await sql`
      UPDATE users
      SET subscription = jsonb_set(
        subscription::jsonb,
        '{status}',
        ${JSON.stringify(status)}::jsonb
      ),
      updated_at = NOW()
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

/**
 * Create or update user subscription
 */
export async function createOrUpdateSubscription(
  userId: number,
  subscription: UserSubscription
): Promise<void> {
  try {
    await sql`
      UPDATE users
      SET subscription = ${JSON.stringify(subscription)}::jsonb,
          subscription_type = ${subscription.packageType},
          subscription_status = ${subscription.status},
          subscription_start_date = ${subscription.startDate},
          updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Also create subscription history entry
    await sql`
      INSERT INTO subscription_history (
        user_id, subscription_type, payment_id, amount, currency, status, started_at, created_at
      )
      VALUES (
        ${userId},
        ${subscription.packageType},
        ${subscription.orderId},
        ${subscription.amount},
        'EUR',
        ${subscription.status},
        ${subscription.startDate},
        NOW()
      )
    `;
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    throw error;
  }
}
