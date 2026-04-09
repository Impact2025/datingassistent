import { logger } from '@/lib/logger';
/**
 * Cron Job: Process Email Queue
 * Runs hourly to send scheduled emails
 * URL: /api/cron/email-queue
 */

import { NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email-sender';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.log('🤖 [CRON] Starting email queue processing...');

    // Process email queue
    await processEmailQueue();

    logger.log('✅ [CRON] Email queue processing completed');

    return NextResponse.json({
      success: true,
      message: 'Email queue processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [CRON] Error processing email queue:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
