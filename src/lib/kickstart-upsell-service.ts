/**
 * Kickstart → Transformatie Upsell Service
 *
 * Schedules and manages the post-purchase upsell email sequence
 * for Kickstart buyers to upgrade to Transformatie.
 *
 * Sequence:
 * - Day 7: Soft upsell after first week
 * - Day 14: Stronger upsell at halfway point
 * - Day 21: Final offer when Kickstart completes
 */

import { sql } from '@vercel/postgres';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';

interface UpsellSequenceConfig {
  userId: number;
  purchaseDate: Date;
  kickstartOrderId?: string;
}

/**
 * Schedule the complete Kickstart → Transformatie upsell sequence
 * Called after successful Kickstart purchase
 */
export async function scheduleKickstartUpsellSequence(config: UpsellSequenceConfig): Promise<void> {
  const { userId, purchaseDate, kickstartOrderId } = config;

  console.log(`📧 Scheduling Kickstart upsell sequence for user ${userId}`);

  try {
    // Check if user already has Transformatie (don't upsell)
    const userResult = await sql`
      SELECT subscription_type, name, email FROM users WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      console.error(`User ${userId} not found`);
      return;
    }

    const user = userResult.rows[0];

    // Don't schedule if already has higher tier
    if (['transformatie', 'vip', 'premium'].includes(user.subscription_type?.toLowerCase())) {
      console.log(`User ${userId} already has ${user.subscription_type}, skipping upsell sequence`);
      return;
    }

    // Calculate schedule dates
    const day7 = new Date(purchaseDate);
    day7.setDate(day7.getDate() + 7);
    day7.setHours(10, 0, 0, 0); // 10:00 AM

    const day14 = new Date(purchaseDate);
    day14.setDate(day14.getDate() + 14);
    day14.setHours(10, 0, 0, 0);

    const day21 = new Date(purchaseDate);
    day21.setDate(day21.getDate() + 21);
    day21.setHours(10, 0, 0, 0);

    // Prepare email data
    const upgradeUrl = `${BASE_URL}/checkout/transformatie-upgrade?userId=${userId}&from=kickstart`;

    const emailData = {
      firstName: user.name || 'daar',
      upgradeUrl,
      kickstartOrderId,
    };

    // Schedule Day 7 email
    await scheduleUpsellEmail({
      userId,
      emailType: 'kickstart_upgrade_day7',
      scheduledFor: day7,
      emailData: { ...emailData, variant: 'day7', daysCompleted: 7 },
    });

    // Schedule Day 14 email
    await scheduleUpsellEmail({
      userId,
      emailType: 'kickstart_upgrade_day14',
      scheduledFor: day14,
      emailData: { ...emailData, variant: 'day14', daysCompleted: 14 },
    });

    // Schedule Day 21 email
    await scheduleUpsellEmail({
      userId,
      emailType: 'kickstart_upgrade_day21',
      scheduledFor: day21,
      emailData: { ...emailData, variant: 'day21', daysCompleted: 21 },
    });

    console.log(`✅ Scheduled 3 upsell emails for user ${userId}`);
  } catch (error) {
    console.error('Error scheduling upsell sequence:', error);
  }
}

/**
 * Schedule a single upsell email
 */
async function scheduleUpsellEmail(params: {
  userId: number;
  emailType: string;
  scheduledFor: Date;
  emailData: Record<string, unknown>;
}): Promise<void> {
  const { userId, emailType, scheduledFor, emailData } = params;

  try {
    // Check if this email is already scheduled (prevent duplicates)
    const existingResult = await sql`
      SELECT id FROM email_queue
      WHERE user_id = ${userId}
        AND email_type = ${emailType}
        AND status IN ('pending', 'processing')
    `;

    if (existingResult.rows.length > 0) {
      console.log(`Email ${emailType} already scheduled for user ${userId}`);
      return;
    }

    // Insert into email queue
    await sql`
      INSERT INTO email_queue (
        user_id,
        email_type,
        email_category,
        scheduled_for,
        email_data,
        priority,
        status,
        created_at
      )
      VALUES (
        ${userId},
        ${emailType},
        'upsell',
        ${scheduledFor.toISOString()},
        ${JSON.stringify(emailData)},
        2,
        'pending',
        NOW()
      )
    `;

    console.log(`📅 Scheduled ${emailType} for ${scheduledFor.toISOString()}`);
  } catch (error) {
    console.error(`Error scheduling ${emailType}:`, error);
  }
}

/**
 * Cancel upsell sequence when user upgrades
 * Called when user purchases Transformatie
 */
export async function cancelKickstartUpsellSequence(userId: number): Promise<void> {
  console.log(`🛑 Cancelling upsell sequence for user ${userId}`);

  try {
    await sql`
      UPDATE email_queue
      SET status = 'cancelled', processed_at = NOW()
      WHERE user_id = ${userId}
        AND email_type IN ('kickstart_upgrade_day7', 'kickstart_upgrade_day14', 'kickstart_upgrade_day21')
        AND status = 'pending'
    `;

    console.log(`✅ Cancelled pending upsell emails for user ${userId}`);
  } catch (error) {
    console.error('Error cancelling upsell sequence:', error);
  }
}

/**
 * Get user's Kickstart progress for email personalization
 */
export async function getKickstartProgress(userId: number): Promise<{
  daysCompleted: number;
  currentScore: number | null;
  improvementPercentage: number | null;
}> {
  try {
    // Get completed days
    const progressResult = await sql`
      SELECT COUNT(*) as completed_days
      FROM kickstart_progress
      WHERE user_id = ${userId} AND completed = true
    `;

    const daysCompleted = parseInt(progressResult.rows[0]?.completed_days || '0');

    // Get photo scores for improvement calculation
    const scoresResult = await sql`
      SELECT
        (SELECT overall_score FROM photo_analysis_history
         WHERE user_id = ${userId} ORDER BY created_at ASC LIMIT 1) as initial_score,
        (SELECT overall_score FROM photo_analysis_history
         WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as current_score
    `;

    const initialScore = scoresResult.rows[0]?.initial_score;
    const currentScore = scoresResult.rows[0]?.current_score;

    let improvementPercentage: number | null = null;
    if (initialScore && currentScore && initialScore > 0) {
      improvementPercentage = Math.round(((currentScore - initialScore) / initialScore) * 100);
    }

    return {
      daysCompleted,
      currentScore: currentScore ? parseFloat(currentScore) : null,
      improvementPercentage,
    };
  } catch (error) {
    console.error('Error getting Kickstart progress:', error);
    return { daysCompleted: 0, currentScore: null, improvementPercentage: null };
  }
}

/**
 * Check if user is eligible for upsell (has Kickstart, not Transformatie)
 */
export async function isEligibleForUpsell(userId: number): Promise<boolean> {
  try {
    const result = await sql`
      SELECT subscription_type FROM users WHERE id = ${userId}
    `;

    if (result.rows.length === 0) return false;

    const subType = result.rows[0].subscription_type?.toLowerCase();

    // Eligible if has Kickstart but not higher tier
    return subType === 'kickstart' && !['transformatie', 'vip', 'premium'].includes(subType);
  } catch (error) {
    console.error('Error checking upsell eligibility:', error);
    return false;
  }
}
