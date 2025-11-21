/**
 * Cron Job: Weekly Email Campaigns
 * Runs every Monday morning to schedule weekly digests
 * URL: /api/cron/weekly-campaigns
 */

import { NextResponse } from 'next/server';
import { runWeeklyEmailCampaigns } from '@/lib/email-engagement';

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

    console.log('🤖 [CRON] Starting weekly email campaigns...');

    // Run weekly campaigns
    await runWeeklyEmailCampaigns();

    console.log('✅ [CRON] Weekly campaigns scheduled');

    return NextResponse.json({
      success: true,
      message: 'Weekly email campaigns scheduled',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [CRON] Error in weekly campaigns:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
