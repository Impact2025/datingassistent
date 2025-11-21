/**
 * Engagement Service
 * Handles user engagement tracking, daily tasks, and progress monitoring
 */

import { sql } from '@vercel/postgres';

export interface EngagementData {
  userId: number;
  journeyDay: number;
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
  weeklyActive: boolean;
  lastActivityDate: string;
}

export interface DailyTask {
  id?: number;
  userId: number;
  taskDate: string;
  journeyDay: number;
  taskType: string;
  taskTitle: string;
  taskDescription?: string;
  taskCategory: 'social' | 'practical' | 'mindset';
  targetValue: number;
  currentValue: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface DailyCheckin {
  userId: number;
  journeyDay: number;
  moodRating: number;
  progressRating: number;
  challenges?: string;
  wins?: string;
  notes?: string;
}

/**
 * Initialize engagement tracking for a new user
 */
export async function initializeEngagement(userId: number): Promise<void> {
  try {
    await sql`
      INSERT INTO user_engagement (
        user_id, journey_day, last_activity_date, current_streak, longest_streak, total_logins
      ) VALUES (
        ${userId}, 1, CURRENT_DATE, 1, 1, 1
      )
      ON CONFLICT (user_id) DO NOTHING
    `;

    // Generate Day 1 tasks (onboarding day)
    await generateDailyTasks(userId, 1);

  } catch (error) {
    console.error('Failed to initialize engagement:', error);
    throw error;
  }
}

/**
 * Update engagement data when user logs in
 */
export async function trackLogin(userId: number): Promise<EngagementData> {
  try {
    const result = await sql`
      SELECT * FROM user_engagement WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      await initializeEngagement(userId);
      return trackLogin(userId);
    }

    const engagement = result.rows[0];
    const lastActivity = new Date(engagement.last_activity_date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = engagement.current_streak;
    if (daysDiff === 1) {
      // Consecutive day
      newStreak = engagement.current_streak + 1;
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
    }

    const newLongestStreak = Math.max(newStreak, engagement.longest_streak);
    const newJourneyDay = engagement.journey_day + (daysDiff > 0 ? daysDiff : 0);

    await sql`
      UPDATE user_engagement
      SET
        last_activity_date = CURRENT_DATE,
        current_streak = ${newStreak},
        longest_streak = ${newLongestStreak},
        total_logins = total_logins + 1,
        journey_day = ${newJourneyDay},
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Generate tasks for today if needed
    if (daysDiff > 0) {
      await generateDailyTasks(userId, newJourneyDay);
    }

    const updated = await sql`
      SELECT * FROM user_engagement WHERE user_id = ${userId}
    `;

    return updated.rows[0] as EngagementData;

  } catch (error) {
    console.error('Failed to track login:', error);
    throw error;
  }
}

/**
 * Generate daily tasks based on journey day
 */
export async function generateDailyTasks(userId: number, journeyDay: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if tasks already exist for today
    const existing = await sql`
      SELECT id FROM daily_tasks
      WHERE user_id = ${userId} AND task_date = ${today}
    `;

    if (existing.rows.length > 0) {
      return; // Tasks already generated
    }

    const tasks = getTasksForDay(journeyDay);

    for (const task of tasks) {
      await sql`
        INSERT INTO daily_tasks (
          user_id, task_date, journey_day, task_type, task_title, task_description,
          task_category, target_value, current_value, status
        ) VALUES (
          ${userId}, ${today}, ${journeyDay}, ${task.taskType}, ${task.taskTitle},
          ${task.taskDescription || null}, ${task.taskCategory}, ${task.targetValue},
          0, 'pending'
        )
      `;
    }

  } catch (error) {
    console.error('Failed to generate daily tasks:', error);
    throw error;
  }
}

/**
 * Get tasks template based on journey day
 */
function getTasksForDay(journeyDay: number): Partial<DailyTask>[] {
  // Day 1: Onboarding completed
  if (journeyDay === 1) {
    return [
      {
        taskType: 'complete_onboarding',
        taskTitle: 'Voltooi je onboarding journey',
        taskDescription: 'Scan, doelen en profiel check afronden',
        taskCategory: 'practical',
        targetValue: 1
      }
    ];
  }

  // Day 2: Soft Push
  if (journeyDay === 2) {
    return [
      {
        taskType: 'review_profile',
        taskTitle: 'Bekijk je geoptimaliseerde profiel',
        taskDescription: 'Check je nieuwe bio en foto volgorde',
        taskCategory: 'practical',
        targetValue: 1
      },
      {
        taskType: 'read_tip',
        taskTitle: 'Lees 1 dating tip',
        taskDescription: 'Kies een tip uit je dashboard',
        taskCategory: 'mindset',
        targetValue: 1
      }
    ];
  }

  // Day 3: Progress Scan
  if (journeyDay === 3) {
    return [
      {
        taskType: 'quick_checkin',
        taskTitle: 'Snelle voortgangs-check',
        taskDescription: 'Hoe gaat het? Deel je ervaring (10 sec)',
        taskCategory: 'mindset',
        targetValue: 1
      },
      {
        taskType: 'profile_action',
        taskTitle: 'Voer 1 profiel actie uit',
        taskDescription: 'Update foto, bio, of voeg iets toe',
        taskCategory: 'practical',
        targetValue: 1
      }
    ];
  }

  // Day 4-5: First Real AI Mission
  if (journeyDay === 4 || journeyDay === 5) {
    return [
      {
        taskType: 'send_messages',
        taskTitle: 'Stuur 3 berichten',
        taskDescription: 'Test je openingszinnen bij matches',
        taskCategory: 'social',
        targetValue: 3
      },
      {
        taskType: 'review_conversations',
        taskTitle: 'Analyseer 1 gesprek',
        taskDescription: 'Gebruik AI Coach voor feedback',
        taskCategory: 'social',
        targetValue: 1
      },
      {
        taskType: 'daily_practice',
        taskTitle: 'Oefen micro-compliment',
        taskDescription: 'In chat of in het echt',
        taskCategory: 'mindset',
        targetValue: 1
      }
    ];
  }

  // Day 6: Mini Reflection
  if (journeyDay === 6) {
    return [
      {
        taskType: 'emoji_reflection',
        taskTitle: 'Hoe ging deze week?',
        taskDescription: 'Kies: 😄 Goed / 😐 OK / 😞 Lastig',
        taskCategory: 'mindset',
        targetValue: 1
      },
      {
        taskType: 'continue_practice',
        taskTitle: 'Blijf actief',
        taskDescription: 'Minimaal 1 interactie vandaag',
        taskCategory: 'social',
        targetValue: 1
      }
    ];
  }

  // Day 7: Week Review
  if (journeyDay === 7) {
    return [
      {
        taskType: 'week_review',
        taskTitle: 'Week 1 Review',
        taskDescription: 'Bekijk je voortgang en nieuwe doelen',
        taskCategory: 'mindset',
        targetValue: 1
      }
    ];
  }

  // Default tasks for any other day
  return [
    {
      taskType: 'daily_activity',
      taskTitle: 'Blijf actief in dating',
      taskDescription: 'Check je matches en gesprekken',
      taskCategory: 'social',
      targetValue: 1
    }
  ];
}

/**
 * Get today's tasks for a user
 */
export async function getTodaysTasks(userId: number): Promise<DailyTask[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await sql`
      SELECT * FROM daily_tasks
      WHERE user_id = ${userId} AND task_date = ${today}
      ORDER BY created_at ASC
    `;

    return result.rows as DailyTask[];

  } catch (error) {
    console.error('Failed to get today\'s tasks:', error);
    throw error;
  }
}

/**
 * Update task progress
 */
export async function updateTaskProgress(
  taskId: number,
  currentValue: number,
  status?: string
): Promise<void> {
  try {
    const newStatus = status || (currentValue >= 1 ? 'completed' : 'in_progress');

    await sql`
      UPDATE daily_tasks
      SET
        current_value = ${currentValue},
        status = ${newStatus},
        completed_at = ${newStatus === 'completed' ? sql`NOW()` : null}
      WHERE id = ${taskId}
    `;

    // Award points for completion
    if (newStatus === 'completed') {
      await logUserAction(
        taskId,
        'task_completed',
        'engagement',
        { taskId },
        10
      );
    }

  } catch (error) {
    console.error('Failed to update task progress:', error);
    throw error;
  }
}

/**
 * Submit daily check-in
 */
export async function submitDailyCheckin(checkin: DailyCheckin): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    await sql`
      INSERT INTO daily_checkins (
        user_id, checkin_date, journey_day, mood_rating, progress_rating,
        challenges, wins, notes
      ) VALUES (
        ${checkin.userId}, ${today}, ${checkin.journeyDay}, ${checkin.moodRating},
        ${checkin.progressRating}, ${checkin.challenges || null},
        ${checkin.wins || null}, ${checkin.notes || null}
      )
      ON CONFLICT (user_id, checkin_date)
      DO UPDATE SET
        mood_rating = ${checkin.moodRating},
        progress_rating = ${checkin.progressRating},
        challenges = ${checkin.challenges || null},
        wins = ${checkin.wins || null},
        notes = ${checkin.notes || null}
    `;

    // Award points
    await logUserAction(
      checkin.userId,
      'daily_checkin',
      'engagement',
      { moodRating: checkin.moodRating, progressRating: checkin.progressRating },
      5
    );

  } catch (error) {
    console.error('Failed to submit checkin:', error);
    throw error;
  }
}

/**
 * Log user action for tracking
 */
export async function logUserAction(
  userId: number,
  actionType: string,
  actionCategory: string | null,
  actionData: any,
  pointsEarned: number = 0
): Promise<void> {
  try {
    await sql`
      INSERT INTO user_actions (
        user_id, action_type, action_category, action_data, points_earned
      ) VALUES (
        ${userId}, ${actionType}, ${actionCategory}, ${JSON.stringify(actionData)}, ${pointsEarned}
      )
    `;
  } catch (error) {
    console.error('Failed to log user action:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Get engagement dashboard data
 */
export async function getEngagementDashboard(userId: number) {
  try {
    const [engagement, todaysTasks, recentActions] = await Promise.all([
      sql`SELECT * FROM user_engagement WHERE user_id = ${userId}`,
      getTodaysTasks(userId),
      sql`
        SELECT * FROM user_actions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 10
      `
    ]);

    const totalPoints = await sql`
      SELECT SUM(points_earned) as total
      FROM user_actions
      WHERE user_id = ${userId}
    `;

    return {
      engagement: engagement.rows[0] || null,
      todaysTasks,
      recentActions: recentActions.rows,
      totalPoints: totalPoints.rows[0]?.total || 0
    };

  } catch (error) {
    console.error('Failed to get engagement dashboard:', error);
    throw error;
  }
}
