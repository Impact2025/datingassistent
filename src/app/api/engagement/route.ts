import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  trackEngagementEvent,
  getUserEngagementMetrics,
  getContentEngagement,
  getUserActivityTimeline,
  type EngagementEvent
} from '@/lib/analytics/engagement-tracker';

export const dynamic = 'force-dynamic';

/**
 * POST /api/engagement
 * Track an engagement event
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { event_type, event_data, session_id } = body;

    if (!event_type || !session_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, session_id' },
        { status: 400 }
      );
    }

    const event: EngagementEvent = {
      user_id: user.id,
      event_type,
      event_data,
      session_id,
      timestamp: new Date()
    };

    await trackEngagementEvent(event);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking engagement:', error);
    return NextResponse.json(
      { error: 'Failed to track engagement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/engagement
 * Get engagement metrics
 * Query params:
 * - type: 'user' | 'content' | 'timeline'
 * - days: number (default: 30)
 * - content_type: 'lesson' | 'program' | 'assessment' (for content type)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user';
    const days = parseInt(searchParams.get('days') || '30');

    if (type === 'user') {
      const metrics = await getUserEngagementMetrics(user.id, days);
      return NextResponse.json(metrics);
    }

    if (type === 'timeline') {
      const limit = parseInt(searchParams.get('limit') || '20');
      const timeline = await getUserActivityTimeline(user.id, limit);
      return NextResponse.json({ timeline });
    }

    if (type === 'content') {
      const contentType = searchParams.get('content_type') as 'lesson' | 'program' | 'assessment' || 'lesson';
      const limit = parseInt(searchParams.get('limit') || '10');
      const contentEngagement = await getContentEngagement(contentType, limit);
      return NextResponse.json({ content: contentEngagement });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error getting engagement metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get engagement metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
