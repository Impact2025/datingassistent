/**
 * In-App Notification Service
 * Handles notifications that appear within the application
 */

import { sql } from '@vercel/postgres';

export interface InAppNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
}

/**
 * Create a new in-app notification
 */
export async function createNotification(data: CreateNotificationData): Promise<InAppNotification> {
  try {
    const result = await sql`
      INSERT INTO in_app_notifications (
        user_id, title, message, type, action_url, action_text, expires_at
      )
      VALUES (
        ${data.userId}, ${data.title}, ${data.message},
        ${data.type || 'info'}, ${data.actionUrl}, ${data.actionText}, ${data.expiresAt}
      )
      RETURNING *
    `;

    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      title: result.rows[0].title,
      message: result.rows[0].message,
      type: result.rows[0].type,
      actionUrl: result.rows[0].action_url,
      actionText: result.rows[0].action_text,
      isRead: false,
      expiresAt: result.rows[0].expires_at,
      createdAt: result.rows[0].created_at
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: number,
  limit: number = 50,
  includeRead: boolean = true
): Promise<InAppNotification[]> {
  try {
    let query = sql`
      SELECT * FROM in_app_notifications
      WHERE user_id = ${userId}
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    if (!includeRead) {
      query = sql`
        SELECT * FROM in_app_notifications
        WHERE user_id = ${userId}
        AND is_read = false
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    const result = await query;

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type,
      actionUrl: row.action_url,
      actionText: row.action_text,
      isRead: row.is_read,
      readAt: row.read_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number, userId: number): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE in_app_notifications
      SET is_read = true, read_at = NOW()
      WHERE id = ${notificationId} AND user_id = ${userId}
    `;

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number): Promise<number> {
  try {
    const result = await sql`
      UPDATE in_app_notifications
      SET is_read = true, read_at = NOW()
      WHERE user_id = ${userId} AND is_read = false
    `;

    return result.rowCount;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number, userId: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM in_app_notifications
      WHERE id = ${notificationId} AND user_id = ${userId}
    `;

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM in_app_notifications
      WHERE user_id = ${userId}
      AND is_read = false
      AND (expires_at IS NULL OR expires_at > NOW())
    `;

    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

/**
 * Create a notification for goal achievement
 */
export async function createGoalAchievementNotification(
  userId: number,
  goalTitle: string,
  achievement: string
): Promise<InAppNotification | null> {
  try {
    return await createNotification({
      userId,
      title: '🎉 Doel Bereikt!',
      message: `Gefeliciteerd! Je hebt je doel "${goalTitle}" bereikt: ${achievement}`,
      type: 'success',
      actionUrl: '/dashboard/goals',
      actionText: 'Bekijk Doelen'
    });
  } catch (error) {
    console.error('Error creating goal achievement notification:', error);
    return null;
  }
}

/**
 * Create a notification for course completion
 */
export async function createCourseCompletionNotification(
  userId: number,
  courseTitle: string
): Promise<InAppNotification | null> {
  try {
    return await createNotification({
      userId,
      title: '🎓 Cursus Voltooid!',
      message: `Geweldig gedaan! Je hebt de cursus "${courseTitle}" succesvol afgerond.`,
      type: 'success',
      actionUrl: '/dashboard/courses',
      actionText: 'Bekijk Cursussen'
    });
  } catch (error) {
    console.error('Error creating course completion notification:', error);
    return null;
  }
}

/**
 * Create a notification for coach message
 */
export async function createCoachMessageNotification(
  userId: number,
  coachName: string,
  preview: string
): Promise<InAppNotification | null> {
  try {
    return await createNotification({
      userId,
      title: '💬 Bericht van je Coach',
      message: `${coachName}: ${preview}`,
      type: 'info',
      actionUrl: '/dashboard/messages',
      actionText: 'Bekijk Bericht'
    });
  } catch (error) {
    console.error('Error creating coach message notification:', error);
    return null;
  }
}

/**
 * Create a notification for upcoming deadline
 */
export async function createDeadlineReminderNotification(
  userId: number,
  itemType: string,
  itemTitle: string,
  daysLeft: number
): Promise<InAppNotification | null> {
  try {
    const title = daysLeft === 0 ? '⏰ Deadline Vandaag!' : `⏰ Deadline Aankomend`;
    const message = daysLeft === 0
      ? `Je ${itemType} "${itemTitle}" moet vandaag afgerond worden.`
      : `Je ${itemType} "${itemTitle}" verloopt over ${daysLeft} dagen.`;

    return await createNotification({
      userId,
      title,
      message,
      type: daysLeft === 0 ? 'warning' : 'info',
      actionUrl: '/dashboard/goals',
      actionText: 'Bekijk Details',
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)) // Expires in 24 hours
    });
  } catch (error) {
    console.error('Error creating deadline reminder notification:', error);
    return null;
  }
}

/**
 * Clean up expired notifications (should be called by cron job)
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM in_app_notifications
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
    `;

    console.log(`🧹 Cleaned up ${result.rowCount} expired notifications`);
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    return 0;
  }
}

/**
 * Send bulk notifications to multiple users
 */
export async function sendBulkNotifications(
  notifications: CreateNotificationData[]
): Promise<InAppNotification[]> {
  const results: InAppNotification[] = [];

  for (const notification of notifications) {
    try {
      const result = await createNotification(notification);
      results.push(result);
    } catch (error) {
      console.error('Error creating bulk notification:', error);
    }
  }

  return results;
}