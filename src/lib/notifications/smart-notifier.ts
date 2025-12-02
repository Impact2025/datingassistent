/**
 * Smart Notification System
 * Sprint 5.6: Context-aware notifications based on user behavior
 *
 * Features:
 * - Achievement unlocked notifications
 * - Progress milestone alerts
 * - Smart study reminders (based on learning patterns)
 * - Streak maintenance alerts
 * - Personalized tip notifications
 */

import { sql } from '@vercel/postgres';

export type NotificationType =
  | 'achievement'
  | 'milestone'
  | 'reminder'
  | 'streak_alert'
  | 'tip'
  | 'recommendation';

export interface Notification {
  id?: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: Date;
  metadata?: Record<string, any>;
}

/**
 * Create a notification
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'is_read' | 'created_at'>): Promise<void> {
  try {
    await sql`
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        priority,
        is_read,
        metadata,
        created_at
      ) VALUES (
        ${notification.user_id},
        ${notification.type},
        ${notification.title},
        ${notification.message},
        ${notification.action_url || null},
        ${notification.priority},
        false,
        ${JSON.stringify(notification.metadata || {})},
        NOW()
      )
    `;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: number,
  unreadOnly: boolean = false,
  limit: number = 20
): Promise<Notification[]> {
  try {
    const result = await sql`
      SELECT *
      FROM notifications
      WHERE user_id = ${userId}
        ${unreadOnly ? sql`AND is_read = false` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows.map(row => ({
      id: parseInt(row.id),
      user_id: parseInt(row.user_id),
      type: row.type,
      title: row.title,
      message: row.message,
      action_url: row.action_url,
      priority: row.priority,
      is_read: row.is_read,
      created_at: new Date(row.created_at),
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${notificationId}
    `;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Generate smart notifications based on user activity
 */
export async function generateSmartNotifications(userId: number): Promise<void> {
  try {
    // Check for streak alerts
    const streakResult = await sql`
      SELECT current_streak
      FROM user_gamification_stats
      WHERE user_id = ${userId}
    `;
    const currentStreak = parseInt(streakResult.rows[0]?.current_streak || '0');

    // Alert if streak is at risk (no activity today)
    const lastActivityResult = await sql`
      SELECT MAX(created_at) as last_activity
      FROM engagement_events
      WHERE user_id = ${userId}
    `;
    const lastActivity = lastActivityResult.rows[0]?.last_activity;
    const hoursSinceActivity = lastActivity
      ? (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60)
      : 24;

    if (currentStreak > 2 && hoursSinceActivity > 20) {
      await createNotification({
        user_id: userId,
        type: 'streak_alert',
        title: '🔥 Je streak staat op het spel!',
        message: `Je hebt een ${currentStreak}-dagen streak. Log in om deze te behouden!`,
        action_url: '/dashboard',
        priority: 'high'
      });
    }

    // Check for milestone achievements
    const completedLessonsResult = await sql`
      SELECT COUNT(*) as count
      FROM user_lesson_progress
      WHERE user_id = ${userId} AND is_completed = true
    `;
    const completedLessons = parseInt(completedLessonsResult.rows[0]?.count || '0');

    // Milestone at 5, 10, 25, 50, 100 lessons
    const milestones = [5, 10, 25, 50, 100];
    if (milestones.includes(completedLessons)) {
      await createNotification({
        user_id: userId,
        type: 'milestone',
        title: '🎉 Mijlpaal bereikt!',
        message: `Je hebt ${completedLessons} lessen voltooid! Blijf doorgaan!`,
        action_url: '/analytics',
        priority: 'medium',
        metadata: { milestone: completedLessons }
      });
    }

    // Smart study reminder (based on best time of day)
    const patternsResult = await sql`
      SELECT
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM engagement_events
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY count DESC
      LIMIT 1
    `;

    if (patternsResult.rows.length > 0) {
      const bestHour = parseInt(patternsResult.rows[0].hour);
      const currentHour = new Date().getHours();

      // Send reminder if it's close to their best time
      if (Math.abs(currentHour - bestHour) <= 1 && hoursSinceActivity > 4) {
        await createNotification({
          user_id: userId,
          type: 'reminder',
          title: '⏰ Perfect moment om te leren!',
          message: `Dit is normaal je meest productieve tijd. Start een les?`,
          action_url: '/cursussen',
          priority: 'low'
        });
      }
    }
  } catch (error) {
    console.error('Error generating smart notifications:', error);
  }
}

/**
 * Initialize notifications table
 */
export async function initNotificationsTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        action_url VARCHAR(255),
        priority VARCHAR(20) DEFAULT 'medium',
        is_read BOOLEAN DEFAULT false,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_user_notifications (user_id, is_read, created_at)
      )
    `;
    console.log('Notifications table initialized');
  } catch (error) {
    console.error('Error initializing notifications table:', error);
  }
}
