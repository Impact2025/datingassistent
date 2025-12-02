import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  getUserNotifications,
  markNotificationAsRead,
  generateSmartNotifications
} from '@/lib/notifications/smart-notifier';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 * Get user notifications
 * Query params:
 * - unread_only: boolean (default: false)
 * - limit: number (default: 20)
 * - generate: boolean (default: false) - Generate smart notifications first
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const shouldGenerate = searchParams.get('generate') === 'true';

    // Optionally generate smart notifications first
    if (shouldGenerate) {
      await generateSmartNotifications(user.id);
    }

    const notifications = await getUserNotifications(user.id, unreadOnly, limit);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/:id
 * Mark notification as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id } = body;

    if (!notification_id) {
      return NextResponse.json({ error: 'Missing notification_id' }, { status: 400 });
    }

    await markNotificationAsRead(notification_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
