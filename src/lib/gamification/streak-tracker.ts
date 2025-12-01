/**
 * Streak Tracker - Daily login streak system
 * Sprint 4: Gamification & Engagement
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: Date | null;
  todayCompleted: boolean;
  streakActive: boolean;
  pointsEarned: number;
  bonusMultiplier: number;
}

/**
 * Track daily login and update streak
 */
export async function trackDailyLogin(userId: number): Promise<StreakData> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if user already logged in today
    const existingLogin = await sql`
      SELECT * FROM user_streaks
      WHERE user_id = ${userId} AND login_date = ${today}
    `;

    if (existingLogin.length > 0) {
      // Already logged in today, return current streak data
      return await getCurrentStreak(userId);
    }

    // Get user's gamification stats
    let userStats = await sql`
      SELECT * FROM user_gamification_stats WHERE user_id = ${userId}
    `;

    // Create stats if not exists
    if (userStats.length === 0) {
      await sql`
        INSERT INTO user_gamification_stats (user_id, current_streak, longest_streak, total_logins)
        VALUES (${userId}, 0, 0, 0)
      `;
      userStats = await sql`
        SELECT * FROM user_gamification_stats WHERE user_id = ${userId}
      `;
    }

    const stats = userStats[0];
    const lastActivityDate = stats.last_activity_date;

    // Calculate new streak
    let newStreak = 1;
    let streakContinued = false;

    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - continue streak
        newStreak = (stats.current_streak || 0) + 1;
        streakContinued = true;
      } else if (diffDays === 0) {
        // Same day (shouldn't happen due to check above, but safety)
        newStreak = stats.current_streak || 1;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    }

    // Calculate points reward
    const basePoints = 10;
    const bonusMultiplier = calculateStreakBonus(newStreak);
    const pointsEarned = Math.floor(basePoints * bonusMultiplier);

    // Record today's login
    await sql`
      INSERT INTO user_streaks (user_id, login_date, streak_count, points_earned, bonus_applied)
      VALUES (${userId}, ${today}, ${newStreak}, ${pointsEarned}, ${bonusMultiplier > 1})
      ON CONFLICT (user_id, login_date) DO NOTHING
    `;

    // Update user stats
    const longestStreak = Math.max(newStreak, stats.longest_streak || 0);

    await sql`
      UPDATE user_gamification_stats
      SET
        current_streak = ${newStreak},
        longest_streak = ${longestStreak},
        last_activity_date = ${today},
        total_logins = total_logins + 1,
        total_points = total_points + ${pointsEarned},
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Award points
    await awardPoints(userId, pointsEarned, 'daily_login', today, `Dagelijkse login streak: ${newStreak} dagen`);

    // Check for streak achievements
    await checkStreakAchievements(userId, newStreak);

    return {
      currentStreak: newStreak,
      longestStreak,
      lastLoginDate: new Date(today),
      todayCompleted: true,
      streakActive: true,
      pointsEarned,
      bonusMultiplier
    };

  } catch (error) {
    console.error('Error tracking daily login:', error);
    throw error;
  }
}

/**
 * Get current streak data for a user
 */
export async function getCurrentStreak(userId: number): Promise<StreakData> {
  try {
    const stats = await sql`
      SELECT * FROM user_gamification_stats WHERE user_id = ${userId}
    `;

    if (stats.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
        todayCompleted: false,
        streakActive: false,
        pointsEarned: 0,
        bonusMultiplier: 1
      };
    }

    const stat = stats[0];
    const today = new Date().toISOString().split('T')[0];

    // Check if logged in today
    const todayLogin = await sql`
      SELECT * FROM user_streaks
      WHERE user_id = ${userId} AND login_date = ${today}
    `;

    // Check if streak is still active
    let streakActive = false;
    if (stat.last_activity_date) {
      const lastDate = new Date(stat.last_activity_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      streakActive = diffDays <= 1;
    }

    return {
      currentStreak: stat.current_streak || 0,
      longestStreak: stat.longest_streak || 0,
      lastLoginDate: stat.last_activity_date ? new Date(stat.last_activity_date) : null,
      todayCompleted: todayLogin.length > 0,
      streakActive,
      pointsEarned: todayLogin.length > 0 ? todayLogin[0].points_earned : 0,
      bonusMultiplier: calculateStreakBonus(stat.current_streak || 0)
    };

  } catch (error) {
    console.error('Error getting current streak:', error);
    throw error;
  }
}

/**
 * Calculate bonus multiplier based on streak length
 */
function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 5;
  if (streakDays >= 14) return 3;
  if (streakDays >= 7) return 2;
  if (streakDays >= 3) return 1.5;
  return 1;
}

/**
 * Award points to user
 */
async function awardPoints(
  userId: number,
  points: number,
  source: string,
  sourceId: string,
  description: string
) {
  try {
    await sql`
      INSERT INTO points_history (user_id, points_amount, points_source, source_id, description)
      VALUES (${userId}, ${points}, ${source}, ${sourceId}, ${description})
    `;
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

/**
 * Check and unlock streak-based achievements
 */
async function checkStreakAchievements(userId: number, streakDays: number) {
  const achievementMap: Record<number, string> = {
    3: 'consistent_user',
    7: 'week_warrior',
    14: 'two_week_streak',
    30: 'month_master',
  };

  const achievementId = achievementMap[streakDays];
  if (!achievementId) return;

  try {
    // Check if achievement already earned
    const existing = await sql`
      SELECT * FROM user_achievements
      WHERE user_id = ${userId} AND achievement_id = ${achievementId}
    `;

    if (existing.length === 0) {
      // Award achievement
      await sql`
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (${userId}, ${achievementId})
        ON CONFLICT (user_id, achievement_id) DO NOTHING
      `;

      // Create notification
      await sql`
        INSERT INTO user_notifications (
          user_id, notification_type, title, message, icon, color, priority
        )
        VALUES (
          ${userId},
          'achievement',
          '🔥 Streak Achievement Unlocked!',
          ${`Je hebt een ${streakDays}-dagen streak bereikt!`},
          'Flame',
          'orange',
          2
        )
      `;
    }
  } catch (error) {
    console.error('Error checking streak achievements:', error);
  }
}

/**
 * Get streak history for user (last 30 days)
 */
export async function getStreakHistory(userId: number, days: number = 30) {
  try {
    const result = await sql`
      SELECT login_date, streak_count, points_earned, bonus_applied
      FROM user_streaks
      WHERE user_id = ${userId}
      ORDER BY login_date DESC
      LIMIT ${days}
    `;

    return result;
  } catch (error) {
    console.error('Error getting streak history:', error);
    return [];
  }
}
