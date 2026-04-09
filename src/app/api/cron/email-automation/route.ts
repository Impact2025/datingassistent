/**
 * Cron Job: Email Automation
 * Runs every 4 hours to check and schedule automated emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { triggerEmailAutomation } from '@/lib/email-engagement';
import { logger } from '@/lib/logger';

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
    logger.log('[CRON] Starting email automation check...');
    const startTime = Date.now();

    await triggerEmailAutomation();

    const duration = Date.now() - startTime;
    logger.log(`[CRON] Email automation completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Email automation check completed',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CRON] Email automation error:', error);
    return NextResponse.json(
      { error: 'Email automation failed', details: String(error) },
      { status: 500 }
    );
  }
}
