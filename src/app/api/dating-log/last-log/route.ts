import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

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

    // Get the most recent weekly log for this user - handle missing table
    let lastLogDate = null;
    let hasLoggedCurrentWeek = false;
    let remindersEnabled = true;
    let lastReminderSent = null;

    try {
      const result = await sql`
        SELECT week_end, created_at
        FROM weekly_dating_logs
        WHERE user_id = ${user.id}
        ORDER BY week_end DESC
        LIMIT 1
      `;
      lastLogDate = result.length > 0 ? result[0].week_end : null;
    } catch (error: any) {
      // If table doesn't exist, assume no logs
      if (error.message?.includes('relation "weekly_dating_logs" does not exist')) {
        console.log('🗄️ weekly_dating_logs table does not exist yet, assuming no logs');
      } else {
        throw error;
      }
    }

    // Check if user should be reminded (Monday and no log for current week)
    const today = new Date();
    const isMonday = today.getDay() === 1; // 0 = Sunday, 1 = Monday

    // Get current week start (Monday)
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay() + 1);
    const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];

    // Check if user has logged current week - handle missing table
    try {
      const currentWeekLog = await sql`
        SELECT id FROM weekly_dating_logs
        WHERE user_id = ${user.id} AND week_start = ${currentWeekStartStr}
      `;
      hasLoggedCurrentWeek = currentWeekLog.length > 0;
    } catch (error: any) {
      // If table doesn't exist, assume no logs
      if (error.message?.includes('relation "weekly_dating_logs" does not exist')) {
        console.log('🗄️ weekly_dating_logs table does not exist yet, assuming no current week logs');
        hasLoggedCurrentWeek = false;
      } else {
        throw error;
      }
    }

    // Check notification preferences - handle missing table
    try {
      const preferences = await sql`
        SELECT monday_reminders_enabled, last_reminder_sent
        FROM user_notification_preferences
        WHERE user_id = ${user.id}
      `;
      remindersEnabled = preferences.length === 0 || preferences[0].monday_reminders_enabled;
      lastReminderSent = preferences.length > 0 ? preferences[0].last_reminder_sent : null;
    } catch (error: any) {
      // If table doesn't exist, use defaults
      if (error.message?.includes('relation "user_notification_preferences" does not exist')) {
        console.log('🗄️ user_notification_preferences table does not exist yet, using defaults');
        remindersEnabled = true;
        lastReminderSent = null;
      } else {
        throw error;
      }
    }

    // Should show notification?
    const shouldShowNotification = isMonday && !hasLoggedCurrentWeek && remindersEnabled;

    return NextResponse.json({
      lastLogDate,
      shouldShowNotification,
      isMonday,
      hasLoggedCurrentWeek,
      currentWeekStart: currentWeekStartStr,
      remindersEnabled
    });

  } catch (error) {
    console.error('Error checking last log date:', error);
    return NextResponse.json(
      {
        error: 'Failed to check last log date',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}