import { sql } from '@vercel/postgres';

export interface TrialStatus {
  isActive: boolean;
  currentDay: number; // 1, 2, or 3
  daysRemaining: number;
  startDate: Date;
  endDate: Date;
  status: 'none' | 'active' | 'expired' | 'converted';
}

export interface TrialLimits {
  aiMessagesPerWeek: number;
  profileRewritesPer30Days: number;
  photoChecksPer30Days: number;
  icebreakersPerDay: number;
  availableTools: string[];
  planName: string;
}

/**
 * Start a 3-day progressive trial for a user
 */
export async function startProgressiveTrial(userId: number): Promise<void> {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 3);

  await sql`
    UPDATE users
    SET trial_status = 'active',
        trial_start_date = ${startDate.toISOString()},
        trial_end_date = ${endDate.toISOString()},
        trial_day = 1
    WHERE id = ${userId}
  `;

  console.log(`✅ Started 3-day progressive trial for user ${userId}`);
}

/**
 * Get current trial status for a user
 */
export async function getTrialStatus(userId: number): Promise<TrialStatus> {
  const result = await sql`
    SELECT trial_status, trial_start_date, trial_end_date, trial_day
    FROM users
    WHERE id = ${userId}
  `;

  if (result.rows.length === 0) {
    return {
      isActive: false,
      currentDay: 0,
      daysRemaining: 0,
      startDate: new Date(),
      endDate: new Date(),
      status: 'none'
    };
  }

  const row = result.rows[0];
  const now = new Date();
  const endDate = new Date(row.trial_end_date);
  const startDate = new Date(row.trial_start_date);

  const isActive = row.trial_status === 'active' && now <= endDate;
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Update trial day based on days since start
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.min(3, Math.max(1, daysSinceStart));

  // Auto-update trial day in database if needed
  if (isActive && currentDay !== row.trial_day) {
    await sql`
      UPDATE users
      SET trial_day = ${currentDay}
      WHERE id = ${userId}
    `;
  }

  return {
    isActive,
    currentDay: isActive ? currentDay : 0,
    daysRemaining,
    startDate,
    endDate,
    status: row.trial_status as TrialStatus['status']
  };
}

/**
 * Get feature limits based on current trial day
 */
export function getTrialLimits(trialDay: number): TrialLimits {
  switch (trialDay) {
    case 1:
      return {
        aiMessagesPerWeek: 60, // Core plan
        profileRewritesPer30Days: 4,
        photoChecksPer30Days: 12,
        icebreakersPerDay: 20,
        availableTools: ['chat-coach', 'profile-coach', 'basic-tools'],
        planName: 'Core Trial - Dag 1'
      };

    case 2:
      return {
        aiMessagesPerWeek: 125, // Pro plan
        profileRewritesPer30Days: 8,
        photoChecksPer30Days: 25,
        icebreakersPerDay: 40,
        availableTools: ['all-core-tools', 'date-planner', 'response-assistant'],
        planName: 'Pro Trial - Dag 2'
      };

    case 3:
      return {
        aiMessagesPerWeek: 250, // Premium plan
        profileRewritesPer30Days: 15,
        photoChecksPer30Days: 50,
        icebreakersPerDay: 100,
        availableTools: ['all-features', 'live-coaching', 'vip-support'],
        planName: 'Premium Trial - Dag 3'
      };

    default:
      return {
        aiMessagesPerWeek: 0,
        profileRewritesPer30Days: 0,
        photoChecksPer30Days: 0,
        icebreakersPerDay: 0,
        availableTools: [],
        planName: 'Trial Expired'
      };
  }
}

/**
 * Check if user has access to a specific feature during trial
 */
export async function hasTrialAccess(userId: number, feature: string): Promise<boolean> {
  const trialStatus = await getTrialStatus(userId);

  if (!trialStatus.isActive) {
    return false; // No trial access
  }

  const limits = getTrialLimits(trialStatus.currentDay);

  // Check tool access
  if (feature.startsWith('tool:')) {
    const toolName = feature.replace('tool:', '');
    return limits.availableTools.includes(toolName) || limits.availableTools.includes('all-features');
  }

  // Check usage limits (this would be integrated with existing usage tracking)
  // For now, return true for all features during active trial
  return true;
}

/**
 * End trial and convert to paid or mark as expired
 */
export async function endTrial(userId: number, converted: boolean = false): Promise<void> {
  const newStatus = converted ? 'converted' : 'expired';

  await sql`
    UPDATE users
    SET trial_status = ${newStatus},
        trial_day = 0
    WHERE id = ${userId}
  `;

  console.log(`✅ Trial ended for user ${userId}, status: ${newStatus}`);
}

/**
 * Get trial progress for UI display
 */
export async function getTrialProgress(userId: number): Promise<{
  progress: number; // 0-100
  currentDay: number;
  daysRemaining: number;
  nextUnlock?: string;
  message: string;
}> {
  const trialStatus = await getTrialStatus(userId);

  if (!trialStatus.isActive) {
    return {
      progress: 0,
      currentDay: 0,
      daysRemaining: 0,
      message: 'Geen actieve trial'
    };
  }

  const progress = (trialStatus.currentDay / 3) * 100;
  const limits = getTrialLimits(trialStatus.currentDay);

  let nextUnlock = '';
  if (trialStatus.currentDay < 3) {
    const nextLimits = getTrialLimits(trialStatus.currentDay + 1);
    nextUnlock = `${nextLimits.aiMessagesPerWeek} berichten/week`;
  }

  const messages = {
    1: `Dag 1: Core toegang - ${limits.aiMessagesPerWeek} berichten/week`,
    2: `Dag 2: Pro toegang - ${limits.aiMessagesPerWeek} berichten/week`,
    3: `Dag 3: Premium toegang - ${limits.aiMessagesPerWeek} berichten/week`
  };

  return {
    progress,
    currentDay: trialStatus.currentDay,
    daysRemaining: trialStatus.daysRemaining,
    nextUnlock,
    message: messages[trialStatus.currentDay as keyof typeof messages] || 'Trial actief'
  };
}