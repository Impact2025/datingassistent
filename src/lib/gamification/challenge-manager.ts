/**
 * Challenge Manager - Daily challenges system
 * Sprint 4: Gamification & Engagement
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Challenge {
  id: number;
  challenge_id: string;
  title: string;
  description: string;
  challenge_type: string;
  difficulty: string;
  points_reward: number;
  bonus_reward: number;
  requirements: any;
  icon: string;
  color: string;
  progress?: number;
  target?: number;
  status?: 'locked' | 'active' | 'completed';
  completed_at?: Date;
}

/**
 * Get today's challenges for a user
 */
export async function getTodayChallenges(userId: number): Promise<Challenge[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all active daily challenges
    const challenges = await sql`
      SELECT * FROM daily_challenges
      WHERE is_active = true AND is_daily = true
      ORDER BY difficulty, points_reward
    `;

    // Get user's progress on today's challenges
    const userProgress = await sql`
      SELECT * FROM user_challenge_progress
      WHERE user_id = ${userId} AND challenge_date = ${today}
    `;

    // Merge challenge data with user progress
    const result: Challenge[] = challenges.map((challenge: any) => {
      const progress = userProgress.find((p: any) => p.challenge_id === challenge.challenge_id);

      return {
        ...challenge,
        progress: progress?.progress || 0,
        target: progress?.target || 100,
        status: progress?.status || 'active',
        completed_at: progress?.completed_at
      };
    });

    return result;

  } catch (error) {
    console.error('Error getting today challenges:', error);
    return [];
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  userId: number,
  challengeId: string,
  progressAmount: number = 1,
  metadata?: any
): Promise<{ completed: boolean; pointsEarned: number }> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get challenge details
    const challengeData = await sql`
      SELECT * FROM daily_challenges WHERE challenge_id = ${challengeId}
    `;

    if (challengeData.length === 0) {
      throw new Error(`Challenge not found: ${challengeId}`);
    }

    const challenge = challengeData[0];

    // Get or create user progress
    let userProgress = await sql`
      SELECT * FROM user_challenge_progress
      WHERE user_id = ${userId}
        AND challenge_id = ${challengeId}
        AND challenge_date = ${today}
    `;

    if (userProgress.length === 0) {
      // Create new progress entry
      await sql`
        INSERT INTO user_challenge_progress (
          user_id, challenge_id, challenge_date, progress, target, status
        )
        VALUES (
          ${userId}, ${challengeId}, ${today}, 0, 100, 'active'
        )
      `;

      userProgress = await sql`
        SELECT * FROM user_challenge_progress
        WHERE user_id = ${userId}
          AND challenge_id = ${challengeId}
          AND challenge_date = ${today}
      `;
    }

    const progress = userProgress[0];

    // Check if already completed
    if (progress.status === 'completed') {
      return { completed: true, pointsEarned: 0 };
    }

    // Update progress
    const newProgress = Math.min(progress.progress + progressAmount, progress.target);
    const isCompleted = newProgress >= progress.target;

    await sql`
      UPDATE user_challenge_progress
      SET
        progress = ${newProgress},
        status = ${isCompleted ? 'completed' : 'active'},
        completed_at = ${isCompleted ? 'NOW()' : null},
        updated_at = NOW()
      WHERE id = ${progress.id}
    `;

    let pointsEarned = 0;

    // If completed, award points
    if (isCompleted) {
      pointsEarned = challenge.points_reward + challenge.bonus_reward;

      // Update user stats
      await sql`
        UPDATE user_gamification_stats
        SET
          total_points = total_points + ${pointsEarned},
          total_challenges_completed = total_challenges_completed + 1,
          updated_at = NOW()
        WHERE user_id = ${userId}
      `;

      // Record points
      await sql`
        INSERT INTO points_history (
          user_id, points_amount, points_source, source_id, description, metadata
        )
        VALUES (
          ${userId},
          ${pointsEarned},
          'challenge',
          ${challengeId},
          ${`Challenge voltooid: ${challenge.title}`},
          ${JSON.stringify(metadata || {})}
        )
      `;

      // Create notification
      await sql`
        INSERT INTO user_notifications (
          user_id, notification_type, title, message, icon, color, priority
        )
        VALUES (
          ${userId},
          'challenge_completed',
          '✅ Challenge Voltooid!',
          ${`Je hebt "${challenge.title}" voltooid en ${pointsEarned} punten verdiend!`},
          ${challenge.icon},
          ${challenge.color},
          1
        )
      `;

      // Check for level up
      await checkLevelUp(userId);
    }

    return { completed: isCompleted, pointsEarned };

  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return { completed: false, pointsEarned: 0 };
  }
}

/**
 * Track specific challenge actions
 */
export async function trackChallengeAction(
  userId: number,
  action: string,
  metadata?: any
): Promise<void> {
  try {
    // Map actions to challenge IDs
    const actionToChallengeMap: Record<string, string> = {
      'login': 'daily_login',
      'chat_session': 'chat_with_iris',
      'assessment_complete': 'complete_assessment',
      'profile_update': 'profile_update',
      'opener_generated': 'generate_opener',
      'chat_coach_used': 'analyze_conversation',
      'tutorial_watched': 'watch_tutorial',
      'tip_read': 'read_tip',
      'tool_used': 'three_tools',
      'goal_set': 'milestone_setter'
    };

    const challengeId = actionToChallengeMap[action];
    if (!challengeId) return;

    // Special handling for 'three_tools' challenge
    if (action === 'tool_used') {
      const toolId = metadata?.toolId;
      if (!toolId) return;

      // Track unique tools used today
      const today = new Date().toISOString().split('T')[0];
      const progress = await sql`
        SELECT metadata FROM user_challenge_progress
        WHERE user_id = ${userId}
          AND challenge_id = 'three_tools'
          AND challenge_date = ${today}
      `;

      let toolsUsed = [];
      if (progress.length > 0 && progress[0].metadata) {
        toolsUsed = progress[0].metadata.toolsUsed || [];
      }

      if (!toolsUsed.includes(toolId)) {
        toolsUsed.push(toolId);

        // Update progress
        await sql`
          UPDATE user_challenge_progress
          SET metadata = ${JSON.stringify({ toolsUsed })}
          WHERE user_id = ${userId}
            AND challenge_id = 'three_tools'
            AND challenge_date = ${today}
        `;

        // Update progress count
        await updateChallengeProgress(userId, 'three_tools', Math.floor(100 / 3));
      }
    } else {
      // Standard progress update
      await updateChallengeProgress(userId, challengeId, 100, metadata);
    }

  } catch (error) {
    console.error('Error tracking challenge action:', error);
  }
}

/**
 * Check if user leveled up
 */
async function checkLevelUp(userId: number) {
  try {
    const stats = await sql`
      SELECT * FROM user_gamification_stats WHERE user_id = ${userId}
    `;

    if (stats.length === 0) return;

    const userStats = stats[0];
    const currentLevel = userStats.current_level || 1;
    const totalPoints = userStats.total_points || 0;

    // Get next level requirements
    const nextLevel = await sql`
      SELECT * FROM level_milestones
      WHERE level = ${currentLevel + 1}
    `;

    if (nextLevel.length === 0) return; // Max level reached

    const levelData = nextLevel[0];

    // Check if user has enough points for next level
    if (totalPoints >= levelData.points_required) {
      // Level up!
      const newLevel = currentLevel + 1;

      await sql`
        UPDATE user_gamification_stats
        SET
          current_level = ${newLevel},
          level_progress = 0,
          updated_at = NOW()
        WHERE user_id = ${userId}
      `;

      // Create level-up notification
      await sql`
        INSERT INTO user_notifications (
          user_id, notification_type, title, message, icon, color, priority
        )
        VALUES (
          ${userId},
          'level_up',
          '🎉 Level Up!',
          ${`Je bent nu level ${newLevel}: ${levelData.title}!`},
          ${levelData.badge_icon},
          ${levelData.badge_color},
          3
        )
      `;

      // Award level-up achievement if exists
      await sql`
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (${userId}, ${`level_${newLevel}`})
        ON CONFLICT (user_id, achievement_id) DO NOTHING
      `;
    } else {
      // Update level progress percentage
      const progressPercentage = Math.floor((totalPoints / levelData.points_required) * 100);

      await sql`
        UPDATE user_gamification_stats
        SET level_progress = ${progressPercentage}
        WHERE user_id = ${userId}
      `;
    }

  } catch (error) {
    console.error('Error checking level up:', error);
  }
}

/**
 * Get challenge completion stats
 */
export async function getChallengeStats(userId: number, days: number = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const stats = await sql`
      SELECT
        challenge_date,
        COUNT(*) as total_challenges,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
        SUM(points_earned) as total_points
      FROM user_challenge_progress
      WHERE user_id = ${userId}
        AND challenge_date >= ${startDateStr}
      GROUP BY challenge_date
      ORDER BY challenge_date DESC
    `;

    return stats;

  } catch (error) {
    console.error('Error getting challenge stats:', error);
    return [];
  }
}
