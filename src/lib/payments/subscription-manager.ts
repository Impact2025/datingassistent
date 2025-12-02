/**
 * Premium Subscription Manager
 * Sprint 6.3: Tiered access & payment management
 */

import { sql } from '@vercel/postgres';

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium';

export interface Subscription {
  user_id: number;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  started_at: Date;
  expires_at?: Date;
  stripe_subscription_id?: string;
}

export const TIER_FEATURES = {
  free: {
    ai_messages_per_month: 10,
    programs_access: 1,
    analytics: false,
    priority_support: false,
    price: 0
  },
  basic: {
    ai_messages_per_month: 100,
    programs_access: 5,
    analytics: true,
    priority_support: false,
    price: 9.99
  },
  pro: {
    ai_messages_per_month: 500,
    programs_access: 'unlimited',
    analytics: true,
    priority_support: true,
    price: 29.99
  },
  premium: {
    ai_messages_per_month: 'unlimited',
    programs_access: 'unlimited',
    analytics: true,
    priority_support: true,
    expert_access: true,
    price: 99.99
  }
};

export async function getUserSubscription(userId: number): Promise<Subscription | null> {
  const result = await sql`
    SELECT * FROM user_subscriptions WHERE user_id = ${userId} AND status = 'active' ORDER BY started_at DESC LIMIT 1
  `;
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createSubscription(userId: number, tier: SubscriptionTier, stripeId?: string): Promise<void> {
  await sql`
    INSERT INTO user_subscriptions (user_id, tier, status, started_at, stripe_subscription_id)
    VALUES (${userId}, ${tier}, 'active', NOW(), ${stripeId || null})
  `;
}

export async function checkFeatureAccess(userId: number, feature: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  const features = TIER_FEATURES[sub.tier];
  return (features as any)[feature] === true || (features as any)[feature] === 'unlimited';
}
