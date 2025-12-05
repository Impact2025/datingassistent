/**
 * Cron Job: Monthly Emails
 * Runs at the end of each month to schedule monthly progress reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { runMonthlyEmailCampaigns } from '@/lib/email-engagement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Only run on the last day of the month
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (today.getDate() !== lastDayOfMonth) {
    return NextResponse.json({
      success: true,
      message: `Skipped - not last day of month (today: ${today.getDate()}, last day: ${lastDayOfMonth})`,
      timestamp: new Date().toISOString()
    });
  }

  try {
    console.log('[CRON] Starting monthly email campaigns...');
    const startTime = Date.now();

    await runMonthlyEmailCampaigns();

    const duration = Date.now() - startTime;
    console.log(`[CRON] Monthly email campaigns scheduled in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Monthly email campaigns scheduled',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CRON] Monthly email campaigns error:', error);
    return NextResponse.json(
      { error: 'Monthly email campaigns failed', details: String(error) },
      { status: 500 }
    );
  }
}
