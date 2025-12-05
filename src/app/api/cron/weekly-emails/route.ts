/**
 * Cron Job: Weekly Emails
 * Runs every Monday at 8:00 AM to schedule weekly email campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { runWeeklyEmailCampaigns } from '@/lib/email-engagement';

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

  try {
    console.log('[CRON] Starting weekly email campaigns...');
    const startTime = Date.now();

    await runWeeklyEmailCampaigns();

    const duration = Date.now() - startTime;
    console.log(`[CRON] Weekly email campaigns scheduled in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Weekly email campaigns scheduled',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CRON] Weekly email campaigns error:', error);
    return NextResponse.json(
      { error: 'Weekly email campaigns failed', details: String(error) },
      { status: 500 }
    );
  }
}
