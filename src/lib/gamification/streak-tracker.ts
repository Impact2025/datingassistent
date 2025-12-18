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
 * Uses the user_streaks table with program_slug architecture
 */
export async function trackDailyLogin(userId: number): Promise<StreakData> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const programSlug = 'general'; // Default program for general login tracking

    // Get or create user streak record
    let userStreak = await sql`
      SELECT * FROM user_streaks
      WHERE user_id = ${userId} AND program_slug = ${programSlug}
    `;

    // Create streak record if not exists
    if (userStreak.length === 0) {
      await sql`
        INSERT INTO user_streaks (user_id, program_slug, current_streak, longest_streak, last_activity_date, total_days_completed)
        VALUES (${userId}, ${programSlug}, 0, 0, NULL, 0)
        ON CONFLICT (user_id, program_slug) DO NOTHING
      `;
      userStreak = await sql`
        SELECT * FROM user_streaks
        WHERE user_id = ${userId} AND program_slug = ${programSlug}
      `;
    }

    const streak = userStreak[0];
    const lastActivityDate = streak?.last_activity_date;

    // Check if already logged in today
    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate).toISOString().split('T')[0];
      if (lastDate === today) {
        // Already logged in today, return current streak data
        return await getCurrentStreak(userId);
      }
    }

    // Calculate new streak
    let newStreak = 1;
    let streakContinued = false;

    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - continue streak
        newStreak = (streak.current_streak || 0) + 1;
        streakContinued = true;
      } else if (diffDays === 0) {
        // Same day
        newStreak = streak.current_streak || 1;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    }

    // Calculate points reward
    const basePoints = 10;
    const bonusMultiplier = calculateStreakBonus(newStreak);
    const pointsEarned = Math.floor(basePoints * bonusMultiplier);

    // Update longest streak if needed
    const longestStreak = Math.max(newStreak, streak?.longest_streak || 0);

    // Update streak record
    await sql`
      UPDATE user_streaks
      SET
        current_streak = ${newStreak},
        longest_streak = ${longestStreak},
        last_activity_date = ${today}::date,
        total_days_completed = total_days_completed + 1,
        updated_at = NOW()
      WHERE user_id = ${userId} AND program_slug = ${programSlug}
    `;

    // Award points (gracefully handle if points_history table doesn't exist)
    try {
      await awardPoints(userId, pointsEarned, 'daily_login', today, `Dagelijkse login streak: ${newStreak} dagen`);
    } catch (e) {
      // Points table may not exist yet, continue without failing
      console.log('Points tracking skipped (table may not exist)');
    }

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
    const programSlug = 'general';
    const today = new Date().toISOString().split('T')[0];

    const streakData = await sql`
      SELECT * FROM user_streaks
      WHERE user_id = ${userId} AND program_slug = ${programSlug}
    `;

    if (streakData.length === 0) {
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

    const streak = streakData[0];

    // Check if logged in today
    const todayCompleted = streak.last_activity_date
      ? new Date(streak.last_activity_date).toISOString().split('T')[0] === today
      : false;

    // Check if streak is still active (logged in today or yesterday)
    let streakActive = false;
    if (streak.last_activity_date) {
      const lastDate = new Date(streak.last_activity_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      streakActive = diffDays <= 1;
    }

    const bonusMultiplier = calculateStreakBonus(streak.current_streak || 0);
    const pointsEarned = todayCompleted ? Math.floor(10 * bonusMultiplier) : 0;

    return {
      currentStreak: streak.current_streak || 0,
      longestStreak: streak.longest_streak || 0,
      lastLoginDate: streak.last_activity_date ? new Date(streak.last_activity_date) : null,
      todayCompleted,
      streakActive,
      pointsEarned,
      bonusMultiplier
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
 * Uses achievement_slug instead of achievement_id to match database schema
 */
async function checkStreakAchievements(userId: number, streakDays: number) {
  const achievementMap: Record<number, string> = {
    3: 'consistent_user',
    7: 'week_warrior',
    14: 'two_week_streak',
    30: 'month_master',
  };

  const achievementSlug = achievementMap[streakDays];
  if (!achievementSlug) return;

  try {
    // Check if achievement already earned (using achievement_slug)
    const existing = await sql`
      SELECT * FROM user_achievements
      WHERE user_id = ${userId} AND achievement_slug = ${achievementSlug}
    `;

    if (existing.length === 0) {
      // Award achievement
      await sql`
        INSERT INTO user_achievements (user_id, achievement_slug, progress, notified)
        VALUES (${userId}, ${achievementSlug}, 100, false)
        ON CONFLICT (user_id, achievement_slug) DO NOTHING
      `;

      // Try to create notification (table may not exist)
      try {
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
      } catch (notifError) {
        // Notification table may not exist, continue
        console.log('Notification skipped (table may not exist)');
      }
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
