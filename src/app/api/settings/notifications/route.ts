import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface NotificationPreferences {
  emailReminders: boolean;
  pushReminders: boolean;
  reminderTime: string; // HH:MM format
  timezone: string;
}

/**
 * GET /api/settings/notifications
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = await getUserIdFromAuth(authHeader);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Get or create notification preferences
    const result = await pool.query<{
      email_reminders: boolean;
      push_reminders: boolean;
      reminder_time: string;
      timezone: string;
    }>(
      `
      INSERT INTO notification_preferences (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING;

      SELECT
        email_reminders,
        push_reminders,
        reminder_time::text,
        timezone
      FROM notification_preferences
      WHERE user_id = $1;
      `,
      [userId]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { success: false, error: 'Failed to get preferences' },
        { status: 500 }
      );
    }

    const prefs: NotificationPreferences = {
      emailReminders: result.rows[0].email_reminders,
      pushReminders: result.rows[0].push_reminders,
      reminderTime: result.rows[0].reminder_time.substring(0, 5), // HH:MM
      timezone: result.rows[0].timezone,
    };

    return NextResponse.json({
      success: true,
      preferences: prefs,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/notifications
 * Update user's notification preferences
 * Body: Partial<NotificationPreferences>
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = await getUserIdFromAuth(authHeader);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates: Partial<NotificationPreferences> = body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.emailReminders !== undefined) {
      updateFields.push(`email_reminders = $${paramIndex++}`);
      values.push(updates.emailReminders);
    }

    if (updates.pushReminders !== undefined) {
      updateFields.push(`push_reminders = $${paramIndex++}`);
      values.push(updates.pushReminders);
    }

    if (updates.reminderTime) {
      updateFields.push(`reminder_time = $${paramIndex++}`);
      values.push(updates.reminderTime);
    }

    if (updates.timezone) {
      updateFields.push(`timezone = $${paramIndex++}`);
      values.push(updates.timezone);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE notification_preferences
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING
        email_reminders,
        push_reminders,
        reminder_time::text,
        timezone;
    `;

    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    const prefs: NotificationPreferences = {
      emailReminders: result.rows[0].email_reminders,
      pushReminders: result.rows[0].push_reminders,
      reminderTime: result.rows[0].reminder_time.substring(0, 5),
      timezone: result.rows[0].timezone,
    };

    return NextResponse.json({
      success: true,
      preferences: prefs,
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Extract user ID from authorization header
 */
async function getUserIdFromAuth(authHeader: string): Promise<number | null> {
  try {
    const token = authHeader.replace('Bearer ', '');

    const result = await pool.query<{ user_id: number }>(
      `SELECT user_id FROM user_sessions WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (result.rows.length > 0) {
      return result.rows[0].user_id;
    }

    return null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
}
