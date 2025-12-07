/**
 * Freemium Access Utilities
 *
 * Manages freemium credits system for the lead activation flow.
 * New users start with 1 free chat credit.
 */

import { sql } from '@vercel/postgres';
import type { FreemiumStatus, CreditType } from '@/types/lead-activation.types';

/**
 * Get freemium status for a user
 */
export async function getFreemiumStatus(userId: number): Promise<FreemiumStatus | null> {
  try {
    const result = await sql`
      SELECT
        freemium_credits,
        initial_photo_score,
        lead_onboarding_completed,
        lead_oto_shown
      FROM users
      WHERE id = ${userId}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      credits: row.freemium_credits ?? 1,
      initialPhotoScore: row.initial_photo_score ? parseFloat(row.initial_photo_score) : null,
      onboardingCompleted: row.lead_onboarding_completed ?? false,
      otoShown: row.lead_oto_shown ?? false,
    };
  } catch (error) {
    console.error('Failed to get freemium status:', error);
    return null;
  }
}

/**
 * Check if user has freemium credits available
 */
export async function hasFreemiumCredits(userId: number): Promise<boolean> {
  try {
    const result = await sql`
      SELECT freemium_credits FROM users WHERE id = ${userId}
    `;

    if (result.rows.length === 0) {
      return false;
    }

    return (result.rows[0].freemium_credits ?? 0) > 0;
  } catch (error) {
    console.error('Failed to check freemium credits:', error);
    return false;
  }
}

/**
 * Use a freemium credit
 * Returns true if credit was successfully used, false if no credits available
 */
export async function useFreemiumCredit(
  userId: number,
  creditType: CreditType
): Promise<boolean> {
  try {
    // Check current credits
    const currentCredits = await sql`
      SELECT freemium_credits FROM users WHERE id = ${userId}
    `;

    if (currentCredits.rows.length === 0 || (currentCredits.rows[0].freemium_credits ?? 0) <= 0) {
      console.log(`No freemium credits available for user ${userId}`);
      return false;
    }

    // Decrement credits
    await sql`
      UPDATE users
      SET freemium_credits = freemium_credits - 1,
          updated_at = NOW()
      WHERE id = ${userId} AND freemium_credits > 0
    `;

    console.log(`Used freemium credit (${creditType}) for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Failed to use freemium credit:', error);
    return false;
  }
}

/**
 * Add freemium credits to a user (for promotions, referrals, etc.)
 */
export async function addFreemiumCredits(
  userId: number,
  amount: number
): Promise<boolean> {
  try {
    await sql`
      UPDATE users
      SET freemium_credits = COALESCE(freemium_credits, 0) + ${amount},
          updated_at = NOW()
      WHERE id = ${userId}
    `;

    console.log(`Added ${amount} freemium credits for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Failed to add freemium credits:', error);
    return false;
  }
}

/**
 * Calculate profile optimization progress for freemium dashboard
 *
 * Progress is based on:
 * - Photo uploaded: 15%
 * - Intake completed: 15%
 * - Profile viewed: 10%
 * - First chat: 20%
 * - Bio written: 20%
 * - Photos added: 20%
 */
export async function getFreemiumProgress(userId: number): Promise<number> {
  try {
    const result = await sql`
      SELECT
        u.initial_photo_score,
        u.lead_onboarding_completed,
        up.lead_intake,
        up.bio,
        up.photos
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id = ${userId}
    `;

    if (result.rows.length === 0) {
      return 0;
    }

    const row = result.rows[0];
    let progress = 0;

    // Photo uploaded during onboarding (15%)
    if (row.initial_photo_score) {
      progress += 15;
    }

    // Intake completed (15%)
    if (row.lead_intake || row.lead_onboarding_completed) {
      progress += 15;
    }

    // Has bio (20%)
    if (row.bio && row.bio.trim().length > 0) {
      progress += 20;
    }

    // Has photos in profile (20%)
    const photos = row.photos;
    if (photos && Array.isArray(photos) && photos.length > 0) {
      progress += 20;
    }

    return progress;
  } catch (error) {
    console.error('Failed to calculate freemium progress:', error);
    return 0;
  }
}

/**
 * Check if user is a freemium user (no active subscription)
 */
export async function isFreemiumUser(userId: number): Promise<boolean> {
  try {
    const result = await sql`
      SELECT
        subscription_status,
        subscription_type
      FROM users
      WHERE id = ${userId}
    `;

    if (result.rows.length === 0) {
      return true; // Unknown user treated as freemium
    }

    const { subscription_status, subscription_type } = result.rows[0];

    // Freemium if no subscription or inactive subscription
    return !subscription_status || subscription_status !== 'active' || !subscription_type;
  } catch (error) {
    console.error('Failed to check if freemium user:', error);
    return true; // Default to freemium on error
  }
}

/**
 * Get recommended upsell based on lead intake data
 */
export async function getRecommendedUpsell(userId: number): Promise<string[]> {
  try {
    const result = await sql`
      SELECT lead_intake FROM user_profiles WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0 || !result.rows[0].lead_intake) {
      return ['transformatie']; // Default recommendation
    }

    const intakeData = result.rows[0].lead_intake as { mainObstacle?: string };
    const obstacle = intakeData.mainObstacle;

    // Map obstacles to recommendations
    const obstacleMap: Record<string, string[]> = {
      'profiel_trekt_niemand_aan': ['kickstart', 'foto-coach'],
      'gesprekken_vallen_stil': ['chat-coach', 'transformatie'],
      'krijg_geen_dates': ['transformatie', 'vip'],
    };

    return obstacleMap[obstacle || ''] || ['transformatie'];
  } catch (error) {
    console.error('Failed to get recommended upsell:', error);
    return ['transformatie'];
  }
}
