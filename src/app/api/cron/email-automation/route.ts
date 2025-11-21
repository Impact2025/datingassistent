/**
 * Cron Job: Email Automation Checks
 * Runs daily to check for automated email triggers
 * URL: /api/cron/email-automation
 */

import { NextResponse } from 'next/server';
import {
  checkAndScheduleInactivityAlerts,
  scheduleSubscriptionRenewalReminders,
} from '@/lib/email-engagement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev_secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 [CRON] Starting email automation checks...');

    // Check and schedule inactivity alerts
    console.log('📧 Checking inactivity alerts...');
    await checkAndScheduleInactivityAlerts();

    // Schedule subscription renewal reminders
    console.log('📧 Checking subscription renewals...');
    await scheduleSubscriptionRenewalReminders();

    console.log('✅ [CRON] Email automation checks completed');

    return NextResponse.json({
      success: true,
      message: 'Email automation checks completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [CRON] Error in email automation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
