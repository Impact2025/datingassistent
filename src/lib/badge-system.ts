/**
 * Badge & Achievement System - Gamification engine for user motivation
 * Provides dopamine hits through recognition and progression
 */

import { sql } from '@vercel/postgres';
import { createNotification } from './in-app-notification-service';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'goal' | 'social' | 'profile' | 'consistency' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  criteria: BadgeCriteria;
  isActive: boolean;
  createdAt: Date;
}

export interface BadgeCriteria {
  type: 'streak' | 'count' | 'achievement' | 'time_based' | 'social';
  threshold: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  conditions?: Record<string, any>;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeCategory: string;
  badgeRarity: string;
  points: number;
  earnedAt: Date;
  isNew: boolean;
}

export interface BadgeProgress {
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  isCompleted: boolean;
  estimatedCompletion?: Date;
}

export class BadgeSystem {
  // Predefined badge templates
  private static readonly BADGE_TEMPLATES: Omit<Badge, 'id' | 'createdAt'>[] = [
    // Streak Badges
    {
      name: 'Eerste Stap',
      description: '7 dagen actief gebleven',
      icon: '👶',
      category: 'streak',
      rarity: 'common',
      points: 10,
      criteria: { type: 'streak', threshold: 7, timeframe: 'all_time' },
      isActive: true
    },
    {
      name: 'Momentum Bouwer',
      description: '30 dagen op rij actief',
      icon: '🚀',
      category: 'streak',
      rarity: 'uncommon',
      points: 50,
      criteria: { type: 'streak', threshold: 30, timeframe: 'all_time' },
      isActive: true
    },
    {
      name: 'Onverslaanbaar',
      description: '100 dagen streak!',
      icon: '💪',
      category: 'streak',
      rarity: 'epic',
      points: 200,
      criteria: { type: 'streak', threshold: 100, timeframe: 'all_time' },
      isActive: true
    },

    // Goal Achievement Badges
    {
      name: 'Doelgericht',
      description: 'Eerste doel succesvol afgerond',
      icon: '🎯',
      category: 'goal',
      rarity: 'common',
      points: 25,
      criteria: { type: 'achievement', threshold: 1, conditions: { goal_completed: true } },
      isActive: true
    },
    {
      name: 'Doelen Crusher',
      description: '10 doelen voltooid',
      icon: '💥',
      category: 'goal',
      rarity: 'rare',
      points: 100,
      criteria: { type: 'count', threshold: 10, conditions: { type: 'goal_completed' } },
      isActive: true
    },

    // Social Badges
    {
      name: 'Communicator',
      description: '50 berichten verstuurd',
      icon: '💬',
      category: 'social',
      rarity: 'common',
      points: 15,
      criteria: { type: 'count', threshold: 50, conditions: { activity_type: 'message_sent' } },
      isActive: true
    },
    {
      name: 'Date Master',
      description: 'Eerste date gepland',
      icon: '💑',
      category: 'social',
      rarity: 'uncommon',
      points: 75,
      criteria: { type: 'achievement', threshold: 1, conditions: { date_scheduled: true } },
      isActive: true
    },
    {
      name: 'Social Butterfly',
      description: '25 dates gehad',
      icon: '🦋',
      category: 'social',
      rarity: 'epic',
      points: 150,
      criteria: { type: 'count', threshold: 25, conditions: { activity_type: 'date_completed' } },
      isActive: true
    },

    // Profile Badges
    {
      name: 'Profiel Starter',
      description: 'Profiel voor 50% compleet',
      icon: '📝',
      category: 'profile',
      rarity: 'common',
      points: 10,
      criteria: { type: 'achievement', threshold: 50, conditions: { profile_completion: true } },
      isActive: true
    },
    {
      name: 'Profiel Pro',
      description: 'Profiel volledig geoptimaliseerd',
      icon: '✨',
      category: 'profile',
      rarity: 'rare',
      points: 80,
      criteria: { type: 'achievement', threshold: 100, conditions: { profile_completion: true } },
      isActive: true
    },

    // Consistency Badges
    {
      name: 'Vroege Vogel',
      description: '30 ochtenden op tijd begonnen',
      icon: '🌅',
      category: 'consistency',
      rarity: 'uncommon',
      points: 40,
      criteria: { type: 'count', threshold: 30, conditions: { time_of_day: 'morning' } },
      isActive: true
    },
    {
      name: 'Reflectie Meester',
      description: '10 wekelijkse reflecties voltooid',
      icon: '🪩',
      category: 'consistency',
      rarity: 'rare',
      points: 90,
      criteria: { type: 'count', threshold: 10, conditions: { activity_type: 'weekly_reflection' } },
      isActive: true
    },

    // Milestone Badges
    {
      name: 'Maand 1 Kampioen',
      description: 'Eerste maand succesvol afgerond',
      icon: '🥇',
      category: 'milestone',
      rarity: 'uncommon',
      points: 60,
      criteria: { type: 'time_based', threshold: 30, timeframe: 'daily', conditions: { journey_days: 30 } },
      isActive: true
    },
    {
      name: 'Half Jaar Held',
      description: '6 maanden consistent gebleven',
      icon: '🎖️',
      category: 'milestone',
      rarity: 'epic',
      points: 300,
      criteria: { type: 'time_based', threshold: 180, timeframe: 'daily', conditions: { journey_days: 180 } },
      isActive: true
    },
    {
      name: 'Dating Legende',
      description: '1 jaar transformation compleet',
      icon: '👑',
      category: 'milestone',
      rarity: 'legendary',
      points: 1000,
      criteria: { type: 'time_based', threshold: 365, timeframe: 'daily', conditions: { journey_days: 365 } },
      isActive: true
    }
  ];

  /**
   * Initialize badge system with predefined badges
   */
  static async initializeBadges(): Promise<void> {
    try {
      for (const badgeTemplate of this.BADGE_TEMPLATES) {
        await sql`
          INSERT INTO badges (name, description, icon, category, rarity, points, criteria, is_active)
          VALUES (
            ${badgeTemplate.name},
            ${badgeTemplate.description},
            ${badgeTemplate.icon},
            ${badgeTemplate.category},
            ${badgeTemplate.rarity},
            ${badgeTemplate.points},
            ${JSON.stringify(badgeTemplate.criteria)},
            ${badgeTemplate.isActive}
          )
          ON CONFLICT (name) DO NOTHING
        `;
      }

      console.log('Badge system initialized with', this.BADGE_TEMPLATES.length, 'badges');
    } catch (error) {
      console.error('Error initializing badge system:', error);
    }
  }

  /**
   * Check and award badges for a user
   */
  static async checkAndAwardBadges(userId: number): Promise<UserBadge[]> {
    try {
      const awardedBadges: UserBadge[] = [];

      // Get all active badges
      const badgesResult = await sql`
        SELECT * FROM badges WHERE is_active = true
      `;

      for (const badge of badgesResult.rows) {
        // Check if user already has this badge
        const existingBadge = await sql`
          SELECT id FROM user_badges
          WHERE user_id = ${userId} AND badge_id = ${badge.id}
        `;

        if (existingBadge.rows.length > 0) continue;

        // Check if user meets criteria
        const meetsCriteria = await this.checkBadgeCriteria(userId, badge.criteria);

        if (meetsCriteria) {
          const awardedBadge = await this.awardBadgeToUser(userId, badge);
          if (awardedBadge) {
            awardedBadges.push(awardedBadge);

            // Send notification
            await createNotification({
              userId,
              title: `🏆 Nieuwe Badge: ${badge.name}!`,
              message: badge.description,
              type: 'success',
              actionUrl: '/journey/badges',
              actionText: 'Bekijk Badges'
            });
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      return [];
    }
  }

  /**
   * Award a specific badge to a user
   */
  static async awardBadgeToUser(userId: number, badge: Badge): Promise<UserBadge | null> {
    try {
      const result = await sql`
        INSERT INTO user_badges (
          user_id, badge_id, badge_name, badge_description,
          badge_icon, badge_category, badge_rarity, points, earned_at
        )
        VALUES (
          ${userId}, ${badge.id}, ${badge.name}, ${badge.description},
          ${badge.icon}, ${badge.category}, ${badge.rarity}, ${badge.points}, NOW()
        )
        RETURNING *
      `;

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        badgeId: row.badge_id,
        badgeName: row.badge_name,
        badgeDescription: row.badge_description,
        badgeIcon: row.badge_icon,
        badgeCategory: row.badge_category,
        badgeRarity: row.badge_rarity,
        points: row.points,
        earnedAt: row.earned_at,
        isNew: true
      };
    } catch (error) {
      console.error('Error awarding badge to user:', error);
      return null;
    }
  }

  /**
   * Get user's badges
   */
  static async getUserBadges(userId: number): Promise<UserBadge[]> {
    try {
      const result = await sql`
        SELECT * FROM user_badges
        WHERE user_id = ${userId}
        ORDER BY earned_at DESC
      `;

      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        badgeId: row.badge_id,
        badgeName: row.badge_name,
        badgeDescription: row.badge_description,
        badgeIcon: row.badge_icon,
        badgeCategory: row.badge_category,
        badgeRarity: row.badge_rarity,
        points: row.points,
        earnedAt: row.earned_at,
        isNew: false // Could be calculated based on recent awards
      }));
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  /**
   * Get badge progress for a user
   */
  static async getBadgeProgress(userId: number): Promise<BadgeProgress[]> {
    try {
      const badgesResult = await sql`
        SELECT * FROM badges WHERE is_active = true
      `;

      const progress: BadgeProgress[] = [];

      for (const badge of badgesResult.rows) {
        // Check if user already has this badge
        const existingBadge = await sql`
          SELECT id FROM user_badges
          WHERE user_id = ${userId} AND badge_id = ${badge.id}
        `;

        if (existingBadge.rows.length > 0) {
          progress.push({
            badgeId: badge.id,
            badgeName: badge.name,
            badgeDescription: badge.description,
            currentValue: badge.criteria.threshold,
            targetValue: badge.criteria.threshold,
            progress: 100,
            isCompleted: true
          });
          continue;
        }

        // Calculate current progress
        const currentValue = await this.calculateBadgeProgress(userId, badge.criteria);

        progress.push({
          badgeId: badge.id,
          badgeName: badge.name,
          badgeDescription: badge.description,
          currentValue,
          targetValue: badge.criteria.threshold,
          progress: Math.min((currentValue / badge.criteria.threshold) * 100, 100),
          isCompleted: currentValue >= badge.criteria.threshold
        });
      }

      return progress.sort((a, b) => b.progress - a.progress);
    } catch (error) {
      console.error('Error getting badge progress:', error);
      return [];
    }
  }

  /**
   * Get user's total badge points
   */
  static async getUserBadgePoints(userId: number): Promise<number> {
    try {
      const result = await sql`
        SELECT COALESCE(SUM(points), 0) as total_points
        FROM user_badges
        WHERE user_id = ${userId}
      `;

      return parseInt(result.rows[0].total_points);
    } catch (error) {
      console.error('Error getting user badge points:', error);
      return 0;
    }
  }

  /**
   * Get badge leaderboard
   */
  static async getBadgeLeaderboard(limit: number = 10): Promise<Array<{
    userId: number;
    userName: string;
    totalPoints: number;
    badgeCount: number;
  }>> {
    try {
      const result = await sql`
        SELECT
          ub.user_id,
          u.name as user_name,
          COALESCE(SUM(ub.points), 0) as total_points,
          COUNT(ub.id) as badge_count
        FROM user_badges ub
        JOIN users u ON ub.user_id = u.id
        GROUP BY ub.user_id, u.name
        ORDER BY total_points DESC
        LIMIT ${limit}
      `;

      return result.rows.map(row => ({
        userId: row.user_id,
        userName: row.user_name,
        totalPoints: parseInt(row.total_points),
        badgeCount: parseInt(row.badge_count)
      }));
    } catch (error) {
      console.error('Error getting badge leaderboard:', error);
      return [];
    }
  }

  /**
   * Mark badges as seen (for new badge notifications)
   */
  static async markBadgesAsSeen(userId: number, badgeIds: number[]): Promise<void> {
    try {
      await sql`
        UPDATE user_badges
        SET is_new = false
        WHERE user_id = ${userId} AND id = ANY(${badgeIds})
      `;
    } catch (error) {
      console.error('Error marking badges as seen:', error);
    }
  }

  // Private helper methods

  private static async checkBadgeCriteria(userId: number, criteria: BadgeCriteria): Promise<boolean> {
    try {
      switch (criteria.type) {
        case 'streak':
          return await this.checkStreakCriteria(userId, criteria);

        case 'count':
          return await this.checkCountCriteria(userId, criteria);

        case 'achievement':
          return await this.checkAchievementCriteria(userId, criteria);

        case 'time_based':
          return await this.checkTimeBasedCriteria(userId, criteria);

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking badge criteria:', error);
      return false;
    }
  }

  private static async checkStreakCriteria(userId: number, criteria: BadgeCriteria): Promise<boolean> {
    const result = await sql`
      SELECT current_streak FROM user_streaks
      WHERE user_id = ${userId} AND streak_type = 'daily_engagement'
    `;

    const currentStreak = parseInt(result.rows[0]?.current_streak || '0');
    return currentStreak >= criteria.threshold;
  }

  private static async checkCountCriteria(userId: number, criteria: BadgeCriteria): Promise<boolean> {
    let query: any;
    const conditions = criteria.conditions || {};

    if (conditions.activity_type) {
      query = sql`
        SELECT COUNT(*) as count FROM user_activity_log
        WHERE user_id = ${userId} AND activity_type = ${conditions.activity_type}
      `;
    } else if (conditions.type === 'goal_completed') {
      query = sql`
        SELECT COUNT(*) as count FROM goal_hierarchies
        WHERE user_id = ${userId} AND status = 'completed'
      `;
    } else {
      return false;
    }

    const result = await query;
    const count = parseInt(result.rows[0].count);
    return count >= criteria.threshold;
  }

  private static async checkAchievementCriteria(userId: number, criteria: BadgeCriteria): Promise<boolean> {
    const conditions = criteria.conditions || {};

    if (conditions.goal_completed) {
      const result = await sql`
        SELECT COUNT(*) as count FROM goal_hierarchies
        WHERE user_id = ${userId} AND status = 'completed'
      `;
      return parseInt(result.rows[0].count) >= criteria.threshold;
    }

    if (conditions.date_scheduled) {
      const result = await sql`
        SELECT COUNT(*) as count FROM user_activity_log
        WHERE user_id = ${userId} AND activity_type = 'date_scheduled'
      `;
      return parseInt(result.rows[0].count) >= criteria.threshold;
    }

    if (conditions.profile_completion) {
      // Mock profile completion check - would need actual profile data
      return Math.random() > 0.5; // Placeholder
    }

    return false;
  }

  private static async checkTimeBasedCriteria(userId: number, criteria: BadgeCriteria): Promise<boolean> {
    const conditions = criteria.conditions || {};

    if (conditions.journey_days) {
      const result = await sql`
        SELECT created_at FROM users WHERE id = ${userId}
      `;

      if (result.rows.length === 0) return false;

      const joinDate = new Date(result.rows[0].created_at);
      const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

      return daysSinceJoin >= criteria.threshold;
    }

    return false;
  }

  private static async calculateBadgeProgress(userId: number, criteria: BadgeCriteria): Promise<number> {
    try {
      switch (criteria.type) {
        case 'streak':
          const streakResult = await sql`
            SELECT current_streak FROM user_streaks
            WHERE user_id = ${userId} AND streak_type = 'daily_engagement'
          `;
          return parseInt(streakResult.rows[0]?.current_streak || '0');

        case 'count':
          const countResult = await sql`
            SELECT COUNT(*) as count FROM user_activity_log
            WHERE user_id = ${userId} AND activity_type = 'message_sent'
          `;
          return parseInt(countResult.rows[0].count);

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating badge progress:', error);
      return 0;
    }
  }

  /**
   * Get rarity color for UI display
   */
  static getRarityColor(rarity: string): string {
    const colors = {
      common: 'text-gray-600',
      uncommon: 'text-green-600',
      rare: 'text-blue-600',
      epic: 'text-purple-600',
      legendary: 'text-yellow-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  /**
   * Get rarity background for UI display
   */
  static getRarityBackground(rarity: string): string {
    const backgrounds = {
      common: 'bg-gray-100',
      uncommon: 'bg-green-100',
      rare: 'bg-blue-100',
      epic: 'bg-purple-100',
      legendary: 'bg-yellow-100'
    };
    return backgrounds[rarity as keyof typeof backgrounds] || backgrounds.common;
  }
}