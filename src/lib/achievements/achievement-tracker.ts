/**
 * Achievement Tracker - Automatisch achievements unlocking
 * Sprint 3: Het Pad
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Achievement {
  id: number;
  achievement_id: string;
  name: string;
  description: string;
  category: string;
  badge_icon: string;
  badge_color: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlock_criteria: any;
  earned_at?: Date;
}

/**
 * Check en unlock achievements voor een user
 */
export async function checkAndUnlockAchievements(userId: number): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];

  try {
    // Haal user data op
    const [journeyData, toolCompletions, userAchievements] = await Promise.all([
      sql`SELECT * FROM user_journey_progress WHERE user_id = ${userId}`,
      sql`SELECT * FROM tool_completions WHERE user_id = ${userId}`,
      sql`SELECT achievement_id FROM user_achievements WHERE user_id = ${userId}`
    ]);

    const journey = journeyData[0];
    const completedTools = toolCompletions.map((t: any) => t.tool_id);
    const earnedAchievementIds = userAchievements.map((a: any) => a.achievement_id);

    // Haal alle achievements op die nog niet unlocked zijn
    const availableAchievements = await sql`
      SELECT * FROM achievements
      WHERE is_active = true
      AND achievement_id NOT IN (
        SELECT achievement_id FROM user_achievements WHERE user_id = ${userId}
      )
    `;

    // Check elke achievement
    for (const achievement of availableAchievements) {
      const criteria = achievement.unlock_criteria;
      let unlocked = false;

      // Check verschillende unlock criteria
      if (criteria.type === 'journey_start' && journey) {
        unlocked = true;
      }

      if (criteria.tool && completedTools.includes(criteria.tool)) {
        unlocked = true;
      }

      if (criteria.phase && criteria.complete) {
        const phaseKey = `phase_${criteria.phase}_completed_at`;
        if (journey && journey[phaseKey]) {
          unlocked = true;
        }
      }

      if (criteria.all_phases_complete && journey) {
        unlocked = journey.phase_1_completed_at &&
                   journey.phase_2_completed_at &&
                   journey.phase_3_completed_at &&
                   journey.phase_4_completed_at &&
                   journey.phase_5_completed_at;
      }

      if (criteria.achievement_count) {
        unlocked = earnedAchievementIds.length >= criteria.achievement_count;
      }

      // Unlock achievement
      if (unlocked) {
        await sql`
          INSERT INTO user_achievements (user_id, achievement_id)
          VALUES (${userId}, ${achievement.achievement_id})
          ON CONFLICT (user_id, achievement_id) DO NOTHING
        `;

        // Create notification
        await createAchievementNotification(userId, achievement);

        newAchievements.push({
          ...achievement,
          earned_at: new Date()
        });
      }
    }

    return newAchievements;

  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Track tool completion en check achievements
 */
export async function trackToolCompletion(
  userId: number,
  toolId: string,
  toolName: string,
  phase: number,
  completionData?: any
): Promise<Achievement[]> {
  try {
    // Record tool completion
    await sql`
      INSERT INTO tool_completions (user_id, tool_id, tool_name, phase, completion_data)
      VALUES (${userId}, ${toolId}, ${toolName}, ${phase}, ${JSON.stringify(completionData || {})})
      ON CONFLICT (user_id, tool_id)
      DO UPDATE SET completed_at = NOW(), completion_data = ${JSON.stringify(completionData || {})}
    `;

    // Update phase progress
    await updatePhaseProgress(userId, phase);

    // Check for new achievements
    return await checkAndUnlockAchievements(userId);

  } catch (error) {
    console.error('Error tracking tool completion:', error);
    return [];
  }
}

/**
 * Update phase progress based on completed tools
 */
async function updatePhaseProgress(userId: number, phase: number) {
  try {
    // Count completed tools in this phase
    const result = await sql`
      SELECT COUNT(*) as count FROM tool_completions
      WHERE user_id = ${userId} AND phase = ${phase}
    `;

    const completedCount = parseInt(result[0].count);

    // Each phase has 4 tools, so progress = (completed / 4) * 100
    const progress = Math.min(Math.round((completedCount / 4) * 100), 100);

    const progressField = `phase_${phase}_progress`;
    const completedField = `phase_${phase}_completed_at`;

    // Update progress
    await sql`
      INSERT INTO user_journey_progress (user_id, ${sql(progressField)}, current_phase)
      VALUES (${userId}, ${progress}, ${phase})
      ON CONFLICT (user_id)
      DO UPDATE SET
        ${sql(progressField)} = ${progress},
        ${sql(completedField)} = CASE WHEN ${progress} = 100 THEN NOW() ELSE ${sql(completedField)} END,
        current_phase = CASE WHEN ${progress} = 100 THEN LEAST(${phase} + 1, 5) ELSE ${phase} END,
        last_activity_at = NOW()
    `;

    // Calculate overall progress (average of all phases)
    const progressData = await sql`
      SELECT
        phase_1_progress, phase_2_progress, phase_3_progress,
        phase_4_progress, phase_5_progress
      FROM user_journey_progress
      WHERE user_id = ${userId}
    `;

    if (progressData.length > 0) {
      const p = progressData[0];
      const overall = Math.round(
        (p.phase_1_progress + p.phase_2_progress + p.phase_3_progress +
         p.phase_4_progress + p.phase_5_progress) / 5
      );

      await sql`
        UPDATE user_journey_progress
        SET overall_progress = ${overall}
        WHERE user_id = ${userId}
      `;
    }

    // If phase completed, create milestone
    if (progress === 100) {
      await createPhaseMilestone(userId, phase);
    }

  } catch (error) {
    console.error('Error updating phase progress:', error);
  }
}

/**
 * Create phase completion milestone
 */
async function createPhaseMilestone(userId: number, phase: number) {
  const milestoneNames = {
    1: 'Fundament Gelegd',
    2: 'Profiel Perfect',
    3: 'Communicatie Master',
    4: 'Actief Dater',
    5: 'Groei Expert'
  };

  try {
    await sql`
      INSERT INTO journey_milestones (user_id, milestone_type, milestone_name, description, phase)
      VALUES (
        ${userId},
        'phase_completion',
        ${milestoneNames[phase as keyof typeof milestoneNames]},
        ${`Je hebt Fase ${phase} volledig afgerond! 🎉`},
        ${phase}
      )
    `;
  } catch (error) {
    console.error('Error creating milestone:', error);
  }
}

/**
 * Create notification for earned achievement
 */
async function createAchievementNotification(userId: number, achievement: any) {
  try {
    await sql`
      INSERT INTO user_notifications (
        user_id, notification_type, title, message, icon, color, priority
      )
      VALUES (
        ${userId},
        'achievement',
        ${`🏆 Achievement Unlocked: ${achievement.name}`},
        ${achievement.description},
        ${achievement.badge_icon},
        ${achievement.badge_color},
        2
      )
    `;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Get user achievements
 * Updated to use achievement_slug instead of achievement_id
 */
export async function getUserAchievements(userId: number): Promise<Achievement[]> {
  try {
    // Get user's unlocked achievements from user_achievements table
    const results = await sql`
      SELECT
        ua.achievement_slug,
        ua.unlocked_at as earned_at,
        ua.progress,
        ua.notified
      FROM user_achievements ua
      WHERE ua.user_id = ${userId}
      ORDER BY ua.unlocked_at DESC
    `;

    // Map to Achievement interface with default values for missing fields
    return results.map((r: any) => ({
      id: r.achievement_slug,
      slug: r.achievement_slug,
      name: getAchievementName(r.achievement_slug),
      description: getAchievementDescription(r.achievement_slug),
      icon: getAchievementIcon(r.achievement_slug),
      category: getAchievementCategory(r.achievement_slug),
      points: getAchievementPoints(r.achievement_slug),
      earned_at: r.earned_at,
      progress: r.progress || 100,
      is_active: true
    })) as Achievement[];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

// Helper functions to get achievement metadata by slug
function getAchievementName(slug: string): string {
  const names: Record<string, string> = {
    'consistent_user': '3-Dagen Streak',
    'week_warrior': 'Week Warrior',
    'two_week_streak': '2 Weken Streak',
    'month_master': 'Maand Master',
    'first_lesson': 'Eerste Les',
    'first_module': 'Module Voltooid',
    'course_complete': 'Cursus Afgerond',
  };
  return names[slug] || slug;
}

function getAchievementDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    'consistent_user': 'Log 3 dagen achter elkaar in',
    'week_warrior': 'Log 7 dagen achter elkaar in',
    'two_week_streak': 'Log 14 dagen achter elkaar in',
    'month_master': 'Log 30 dagen achter elkaar in',
    'first_lesson': 'Voltooi je eerste les',
    'first_module': 'Voltooi je eerste module',
    'course_complete': 'Rond een volledige cursus af',
  };
  return descriptions[slug] || '';
}

function getAchievementIcon(slug: string): string {
  const icons: Record<string, string> = {
    'consistent_user': 'Flame',
    'week_warrior': 'Zap',
    'two_week_streak': 'Trophy',
    'month_master': 'Crown',
    'first_lesson': 'BookOpen',
    'first_module': 'Award',
    'course_complete': 'GraduationCap',
  };
  return icons[slug] || 'Star';
}

function getAchievementCategory(slug: string): string {
  if (slug.includes('streak') || slug.includes('warrior') || slug.includes('master') || slug === 'consistent_user') {
    return 'streak';
  }
  if (slug.includes('lesson') || slug.includes('module') || slug.includes('course')) {
    return 'learning';
  }
  return 'general';
}

function getAchievementPoints(slug: string): number {
  const points: Record<string, number> = {
    'consistent_user': 50,
    'week_warrior': 100,
    'two_week_streak': 200,
    'month_master': 500,
    'first_lesson': 25,
    'first_module': 75,
    'course_complete': 300,
  };
  return points[slug] || 10;
}

/**
 * Get achievement progress (how many achievements unlocked per category)
 * Updated to work without achievements master table
 */
export async function getAchievementProgress(userId: number) {
  try {
    // Count user's earned achievements
    const earned = await sql`SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ${userId}`;
    const earnedCount = parseInt(earned[0]?.count || '0');

    // Total available achievements (hardcoded since we don't have master table)
    const totalAchievements = 7; // streak (4) + learning (3)

    // Get achievements by category
    const userAchievements = await sql`
      SELECT achievement_slug FROM user_achievements WHERE user_id = ${userId}
    `;

    // Count by category
    const categoryCount: Record<string, { total: number; earned: number }> = {
      streak: { total: 4, earned: 0 },
      learning: { total: 3, earned: 0 },
    };

    userAchievements.forEach((ua: any) => {
      const category = getAchievementCategory(ua.achievement_slug);
      if (categoryCount[category]) {
        categoryCount[category].earned++;
      }
    });

    const byCategory = Object.entries(categoryCount).map(([category, data]) => ({
      category,
      total: data.total,
      earned: data.earned
    }));

    return {
      total: totalAchievements,
      earned: earnedCount,
      percentage: totalAchievements > 0 ? Math.round((earnedCount / totalAchievements) * 100) : 0,
      by_category: byCategory
    };
  } catch (error) {
    console.error('Error fetching achievement progress:', error);
    return { total: 0, earned: 0, percentage: 0, by_category: [] };
  }
}
