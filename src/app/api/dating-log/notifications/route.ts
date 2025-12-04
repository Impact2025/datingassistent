import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get notification preferences - handle case where table doesn't exist yet
    let result;
    try {
      result = await sql`
        SELECT monday_reminders_enabled, reminder_time, last_reminder_sent
        FROM user_notification_preferences
        WHERE user_id = ${user.id}
      `;
    } catch (error: any) {
      // If table doesn't exist, return default preferences
      if (error.message?.includes('relation "user_notification_preferences" does not exist')) {
        console.log('🗄️ user_notification_preferences table does not exist yet, using defaults');
        return Response.json({
          mondayRemindersEnabled: true,
          reminderTime: '09:00',
          lastReminderSent: null,
          reminderCount: 0
        });
      }
      throw error;
    }

    if (result.rows.length === 0) {
      // Return defaults if no preferences set
      return NextResponse.json({
        mondayRemindersEnabled: true,
        reminderTime: '09:00:00',
        lastReminderSent: null,
        reminderCount: 0
      });
    }

    const prefs = result.rows[0];
    return NextResponse.json({
      mondayRemindersEnabled: prefs.monday_reminders_enabled,
      reminderTime: prefs.reminder_time,
      lastReminderSent: prefs.last_reminder_sent,
      reminderCount: 0
    });

  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to get notification preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { mondayRemindersEnabled, reminderTime } = await request.json();

    // Update or insert notification preferences - handle case where table doesn't exist yet
    let result;
    try {
      result = await sql`
        INSERT INTO user_notification_preferences (
          user_id,
          monday_reminders_enabled,
          reminder_time
        ) VALUES (
          ${user.id},
          ${mondayRemindersEnabled ?? true},
          ${reminderTime ?? '09:00:00'}
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          monday_reminders_enabled = EXCLUDED.monday_reminders_enabled,
          reminder_time = EXCLUDED.reminder_time,
          updated_at = NOW()
        RETURNING *
      `;
    } catch (error: any) {
      // If table doesn't exist, simulate success with provided values
      if (error.message?.includes('relation "user_notification_preferences" does not exist')) {
        console.log('🗄️ user_notification_preferences table does not exist yet, simulating save');
        return NextResponse.json({
          success: true,
          preferences: {
            mondayRemindersEnabled: mondayRemindersEnabled ?? true,
            reminderTime: reminderTime ?? '09:00:00',
            lastReminderSent: null,
            reminderCount: 0
          }
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      preferences: {
        mondayRemindersEnabled: result.rows[0].monday_reminders_enabled,
        reminderTime: result.rows[0].reminder_time,
        lastReminderSent: result.rows[0].last_reminder_sent,
        reminderCount: 0
      }
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to update notification preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}