/**
 * API: Schedule Kickstart → Transformatie Upsell Sequence
 *
 * Called after successful Kickstart purchase to schedule
 * the post-purchase upsell email sequence.
 *
 * POST /api/upsell/schedule-kickstart-sequence
 * Body: { userId: number, orderId?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { scheduleKickstartUpsellSequence, cancelKickstartUpsellSequence } from '@/lib/kickstart-upsell-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, orderId, action } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Cancel action - used when user upgrades to Transformatie
    if (action === 'cancel') {
      await cancelKickstartUpsellSequence(userId);
      return NextResponse.json({
        success: true,
        message: 'Upsell sequence cancelled',
      });
    }

    // Schedule the upsell sequence
    await scheduleKickstartUpsellSequence({
      userId,
      purchaseDate: new Date(),
      kickstartOrderId: orderId,
    });

    return NextResponse.json({
      success: true,
      message: 'Upsell sequence scheduled',
      scheduledEmails: [
        { type: 'kickstart_upgrade_day7', scheduledFor: 'Day 7' },
        { type: 'kickstart_upgrade_day14', scheduledFor: 'Day 14' },
        { type: 'kickstart_upgrade_day21', scheduledFor: 'Day 21' },
      ],
    });
  } catch (error) {
    console.error('Error scheduling upsell sequence:', error);
    return NextResponse.json(
      { error: 'Failed to schedule upsell sequence' },
      { status: 500 }
    );
  }
}

// GET: Check upsell sequence status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Import sql here to avoid issues
    const { sql } = await import('@vercel/postgres');

    // Get scheduled upsell emails for this user
    const result = await sql`
      SELECT
        id,
        email_type,
        scheduled_for,
        status,
        processed_at
      FROM email_queue
      WHERE user_id = ${parseInt(userId)}
        AND email_type IN ('kickstart_upgrade_day7', 'kickstart_upgrade_day14', 'kickstart_upgrade_day21')
      ORDER BY scheduled_for ASC
    `;

    return NextResponse.json({
      success: true,
      userId: parseInt(userId),
      scheduledEmails: result.rows,
    });
  } catch (error) {
    console.error('Error fetching upsell status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upsell status' },
      { status: 500 }
    );
  }
}
