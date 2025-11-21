import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const user = await requireAuth(request);

    const { sessionId, eventType, metadata } = await request.json();

    if (!sessionId || !eventType) {
      return NextResponse.json(
        { error: 'sessionId and eventType are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking profile analytics for user ${user.id}: ${eventType}`);

    // Insert analytics event
    await sql`
      INSERT INTO profile_analytics_events (
        user_id, session_id, event_type, metadata, created_at
      ) VALUES (
        ${user.id}, ${sessionId}, ${eventType},
        ${JSON.stringify(metadata || {})}, NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Analytics event tracked successfully'
    });

  } catch (error) {
    console.error('Profile analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics event' },
      { status: 500 }
    );
  }
}