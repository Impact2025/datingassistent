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
 */
export async function getUserAchievements(userId: number): Promise<Achievement[]> {
  try {
    const results = await sql`
      SELECT a.*, ua.earned_at
      FROM achievements a
      JOIN user_achievements ua ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ${userId}
      ORDER BY ua.earned_at DESC
    `;

    return results as Achievement[];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

/**
 * Get achievement progress (how many achievements unlocked per category)
 */
export async function getAchievementProgress(userId: number) {
  try {
    const total = await sql`SELECT COUNT(*) as count FROM achievements WHERE is_active = true`;
    const earned = await sql`SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ${userId}`;

    const byCategory = await sql`
      SELECT
        a.category,
        COUNT(*) as total,
        COUNT(ua.id) as earned
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.achievement_id = ua.achievement_id AND ua.user_id = ${userId}
      WHERE a.is_active = true
      GROUP BY a.category
    `;

    return {
      total: parseInt(total[0].count),
      earned: parseInt(earned[0].count),
      percentage: Math.round((parseInt(earned[0].count) / parseInt(total[0].count)) * 100),
      by_category: byCategory
    };
  } catch (error) {
    console.error('Error fetching achievement progress:', error);
    return { total: 0, earned: 0, percentage: 0, by_category: [] };
  }
}
