/**
 * Badge Service
 * Manages achievement badges and gamification system
 */

import { sql } from '@vercel/postgres';
import { logUserAction } from './engagement-service';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id?: number;
  userId: number;
  badgeType: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  tier: BadgeTier;
  earnedAt?: string;
  displayed: boolean;
}

export interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  requirement: (metrics: any) => boolean;
  points: number;
}

/**
 * All available badge definitions
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak Badges
  {
    type: 'streak_3',
    name: 'Starter Streak',
    description: '3 dagen achter elkaar actief',
    icon: '🔥',
    tier: 'bronze',
    requirement: (m) => m.currentStreak >= 3,
    points: 50
  },
  {
    type: 'streak_7',
    name: 'Week Warrior',
    description: '7 dagen achter elkaar actief',
    icon: '🔥',
    tier: 'silver',
    requirement: (m) => m.currentStreak >= 7,
    points: 100
  },
  {
    type: 'streak_30',
    name: 'Maand Master',
    description: '30 dagen achter elkaar actief',
    icon: '🔥',
    tier: 'gold',
    points: 500,
    requirement: (m) => m.currentStreak >= 30
  },
  {
    type: 'streak_100',
    name: 'Consistency Champion',
    description: '100 dagen achter elkaar actief',
    icon: '🔥',
    tier: 'platinum',
    points: 2000,
    requirement: (m) => m.currentStreak >= 100
  },

  // Task Completion Badges
  {
    type: 'tasks_10',
    name: 'Getting Started',
    description: '10 taken voltooid',
    icon: '✅',
    tier: 'bronze',
    points: 50,
    requirement: (m) => m.totalTasksCompleted >= 10
  },
  {
    type: 'tasks_50',
    name: 'Task Master',
    description: '50 taken voltooid',
    icon: '✅',
    tier: 'silver',
    points: 150,
    requirement: (m) => m.totalTasksCompleted >= 50
  },
  {
    type: 'tasks_100',
    name: 'Productivity Pro',
    description: '100 taken voltooid',
    icon: '✅',
    tier: 'gold',
    points: 300,
    requirement: (m) => m.totalTasksCompleted >= 100
  },
  {
    type: 'tasks_500',
    name: 'Achievement Hunter',
    description: '500 taken voltooid',
    icon: '✅',
    tier: 'platinum',
    points: 1500,
    requirement: (m) => m.totalTasksCompleted >= 500
  },

  // Social Badges
  {
    type: 'matches_10',
    name: 'Match Maker',
    description: '10 quality matches',
    icon: '💘',
    tier: 'bronze',
    points: 100,
    requirement: (m) => m.totalMatches >= 10
  },
  {
    type: 'matches_50',
    name: 'Popular Player',
    description: '50 quality matches',
    icon: '💘',
    tier: 'silver',
    points: 300,
    requirement: (m) => m.totalMatches >= 50
  },
  {
    type: 'matches_100',
    name: 'Match Magnet',
    description: '100 quality matches',
    icon: '💘',
    tier: 'gold',
    points: 600,
    requirement: (m) => m.totalMatches >= 100
  },

  // Conversation Badges
  {
    type: 'conversations_10',
    name: 'Great Conversationalist',
    description: '10 betekenisvolle gesprekken',
    icon: '💬',
    tier: 'bronze',
    points: 100,
    requirement: (m) => m.meaningfulConversations >= 10
  },
  {
    type: 'conversations_50',
    name: 'Social Butterfly',
    description: '50 betekenisvolle gesprekken',
    icon: '💬',
    tier: 'silver',
    points: 300,
    requirement: (m) => m.meaningfulConversations >= 50
  },
  {
    type: 'conversations_100',
    name: 'Communication Expert',
    description: '100 betekenisvolle gesprekken',
    icon: '💬',
    tier: 'gold',
    points: 600,
    requirement: (m) => m.meaningfulConversations >= 100
  },

  // Date Badges
  {
    type: 'dates_5',
    name: 'Date Starter',
    description: '5 dates gehad',
    icon: '🌟',
    tier: 'bronze',
    points: 150,
    requirement: (m) => m.totalDates >= 5
  },
  {
    type: 'dates_10',
    name: 'Dating Pro',
    description: '10 dates gehad',
    icon: '🌟',
    tier: 'silver',
    points: 300,
    requirement: (m) => m.totalDates >= 10
  },
  {
    type: 'dates_25',
    name: 'Date Master',
    description: '25 dates gehad',
    icon: '🌟',
    tier: 'gold',
    points: 750,
    requirement: (m) => m.totalDates >= 25
  },

  // Profile Badges
  {
    type: 'profile_optimizer',
    name: 'Profile Optimizer',
    description: 'Profiel 10x geoptimaliseerd',
    icon: '📸',
    tier: 'silver',
    points: 200,
    requirement: (m) => m.profileUpdates >= 10
  },
  {
    type: 'profile_perfectionist',
    name: 'Profile Perfectionist',
    description: 'Profiel 25x geoptimaliseerd',
    icon: '📸',
    tier: 'gold',
    points: 500,
    requirement: (m) => m.profileUpdates >= 25
  },

  // Points Badges
  {
    type: 'points_1000',
    name: 'Point Collector',
    description: '1000 punten verzameld',
    icon: '⭐',
    tier: 'bronze',
    points: 100,
    requirement: (m) => m.totalPoints >= 1000
  },
  {
    type: 'points_5000',
    name: 'Point Master',
    description: '5000 punten verzameld',
    icon: '⭐',
    tier: 'silver',
    points: 500,
    requirement: (m) => m.totalPoints >= 5000
  },
  {
    type: 'points_10000',
    name: 'Point Legend',
    description: '10000 punten verzameld',
    icon: '⭐',
    tier: 'gold',
    points: 1000,
    requirement: (m) => m.totalPoints >= 10000
  },

  // Special Badges
  {
    type: 'early_adopter',
    name: 'Early Adopter',
    description: 'Een van de eerste gebruikers!',
    icon: '🚀',
    tier: 'platinum',
    points: 500,
    requirement: (m) => m.userId <= 100
  },
  {
    type: 'perfect_week',
    name: 'Perfect Week',
    description: '7 dagen alle taken voltooid',
    icon: '💯',
    tier: 'gold',
    points: 300,
    requirement: (m) => m.perfectWeeks >= 1
  },
  {
    type: 'top_10_profile',
    name: 'Top 10% Profile Score',
    description: 'Profiel in top 10% gebruikers',
    icon: '🏆',
    tier: 'platinum',
    points: 1000,
    requirement: (m) => m.profileScore >= 90
  }
];

/**
 * Check and award badges for a user
 */
export async function checkAndAwardBadges(userId: number): Promise<Badge[]> {
  try {
    // Get user metrics
    const metrics = await getUserMetrics(userId);

    // Get already earned badges (with error handling)
    let earnedTypes = new Set<string>();
    try {
      const earnedBadges = await sql`
        SELECT badge_type
        FROM user_badges
        WHERE user_id = ${userId}
      `;
      earnedTypes = new Set(earnedBadges.rows.map(b => b.badge_type));
    } catch (error) {
      console.warn('Could not fetch earned badges, assuming none earned:', error);
      // Continue with empty set - badges table might not exist yet
    }

    // Check which new badges can be awarded
    const newBadges: Badge[] = [];

    for (const def of BADGE_DEFINITIONS) {
      // Skip if already earned
      if (earnedTypes.has(def.type)) continue;

      // Check if requirement is met
      if (def.requirement(metrics)) {
        try {
          const badge = await awardBadge(userId, def);
          newBadges.push(badge);
        } catch (error) {
          console.warn(`Failed to award badge ${def.type}:`, error);
          // Continue with other badges
        }
      }
    }

    return newBadges;

  } catch (error) {
    console.error('Failed to check and award badges:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}

/**
 * Award a specific badge to a user
 */
async function awardBadge(userId: number, definition: BadgeDefinition): Promise<Badge> {
  const badge: Badge = {
    userId,
    badgeType: definition.type,
    badgeName: definition.name,
    badgeDescription: definition.description,
    badgeIcon: definition.icon,
    tier: definition.tier,
    displayed: true
  };

  // Insert badge
  const result = await sql`
    INSERT INTO user_badges (
      user_id, badge_type, badge_name, badge_description,
      badge_icon, tier, earned_at, displayed
    ) VALUES (
      ${userId}, ${badge.badgeType}, ${badge.badgeName},
      ${badge.badgeDescription}, ${badge.badgeIcon}, ${badge.tier},
      NOW(), ${badge.displayed}
    )
    RETURNING *
  `;

  // Award points
  await logUserAction(
    userId,
    'badge_earned',
    'achievement',
    { badgeType: badge.badgeType, tier: badge.tier },
    definition.points
  );

  // Log milestone
  await sql`
    INSERT INTO progress_milestones (
      user_id, milestone_type, milestone_title, milestone_description,
      points_awarded, celebrated
    ) VALUES (
      ${userId}, 'badge_earned', ${badge.badgeName},
      ${badge.badgeDescription}, ${definition.points}, false
    )
  `;

  return result.rows[0] as Badge;
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: number): Promise<Badge[]> {
  const result = await sql`
    SELECT *
    FROM user_badges
    WHERE user_id = ${userId}
    ORDER BY earned_at DESC
  `;

  return result.rows as Badge[];
}

/**
 * Get user metrics for badge checking
 */
async function getUserMetrics(userId: number) {
  try {
    const [engagement, tasks, actions] = await Promise.all([
      sql`SELECT * FROM user_engagement WHERE user_id = ${userId}`,
      sql`SELECT COUNT(*) as total FROM daily_tasks WHERE user_id = ${userId} AND status = 'completed'`,
      sql`SELECT SUM(points_earned) as total FROM user_actions WHERE user_id = ${userId}`
    ]);

    const engagementData = engagement.rows[0] || {};

    return {
      userId,
      currentStreak: engagementData.current_streak || 0,
      longestStreak: engagementData.longest_streak || 0,
      totalTasksCompleted: tasks.rows[0]?.total || 0,
      totalPoints: actions.rows[0]?.total || 0,
      totalMatches: 0, // Would come from actual data - performance_metrics table doesn't exist yet
      meaningfulConversations: 0, // Would come from actual data
      totalDates: 0, // Would come from actual data
      profileUpdates: 0, // Would come from actual data
      perfectWeeks: 0, // Would come from actual data
      profileScore: 0 // Would come from actual data
    };
  } catch (error) {
    console.error('Error getting user metrics:', error);
    // Return default metrics if database queries fail
    return {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      totalTasksCompleted: 0,
      totalPoints: 0,
      totalMatches: 0,
      meaningfulConversations: 0,
      totalDates: 0,
      profileUpdates: 0,
      perfectWeeks: 0,
      profileScore: 0
    };
  }
}

/**
 * Get badge progress for UI
 */
export async function getBadgeProgress(userId: number) {
  try {
    const metrics = await getUserMetrics(userId);

    let earnedBadges: Badge[] = [];
    try {
      earnedBadges = await getUserBadges(userId);
    } catch (error) {
      console.warn('Could not fetch earned badges:', error);
      // Continue with empty array
    }

    const earnedTypes = new Set(earnedBadges.map(b => b.badgeType));

    const progress = BADGE_DEFINITIONS.map(def => {
      const earned = earnedTypes.has(def.type);
      const meetsRequirement = def.requirement(metrics);

      return {
        type: def.type,
        name: def.name,
        description: def.description,
        icon: def.icon,
        tier: def.tier,
        points: def.points,
        earned,
        progress: meetsRequirement ? 100 : getProgressPercentage(def.type, metrics)
      };
    });

    return {
      badges: progress,
      totalEarned: earnedBadges.length,
      totalAvailable: BADGE_DEFINITIONS.length,
      nextBadge: progress.find(b => !b.earned && b.progress > 0)
    };
  } catch (error) {
    console.error('Failed to get badge progress:', error);
    // Return default progress data
    return {
      badges: BADGE_DEFINITIONS.map(def => ({
        type: def.type,
        name: def.name,
        description: def.description,
        icon: def.icon,
        tier: def.tier,
        points: def.points,
        earned: false,
        progress: 0
      })),
      totalEarned: 0,
      totalAvailable: BADGE_DEFINITIONS.length,
      nextBadge: null
    };
  }
}

/**
 * Calculate progress percentage for a badge
 */
function getProgressPercentage(type: string, metrics: any): number {
  // Simple progress calculation based on badge type
  if (type.startsWith('streak_')) {
    const target = parseInt(type.split('_')[1]);
    return Math.min(100, (metrics.currentStreak / target) * 100);
  }

  if (type.startsWith('tasks_')) {
    const target = parseInt(type.split('_')[1]);
    return Math.min(100, (metrics.totalTasksCompleted / target) * 100);
  }

  if (type.startsWith('points_')) {
    const target = parseInt(type.split('_')[1]);
    return Math.min(100, (metrics.totalPoints / target) * 100);
  }

  return 0;
}
