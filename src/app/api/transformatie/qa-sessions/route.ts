/**
 * API: GET /api/transformatie/qa-sessions
 *
 * Returns upcoming and past Q&A sessions for Transformatie program.
 * Public for enrolled users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const includeRecordings = searchParams.get('includeRecordings') === 'true';
    const upcoming = searchParams.get('upcoming') === 'true';

    // Build query
    let query = sql`
      SELECT
        id,
        title,
        description,
        session_date,
        session_time,
        duration_minutes,
        zoom_link,
        zoom_meeting_id,
        max_participants,
        status,
        program,
        is_recording_available,
        recording_url,
        created_at
      FROM qa_sessions
      WHERE program = 'transformatie'
    `;

    // Filter for upcoming sessions only
    if (upcoming) {
      query = sql`
        SELECT
          id,
          title,
          description,
          session_date,
          session_time,
          duration_minutes,
          zoom_link,
          zoom_meeting_id,
          max_participants,
          status,
          program,
          is_recording_available,
          recording_url,
          created_at
        FROM qa_sessions
        WHERE program = 'transformatie'
          AND session_date >= CURRENT_DATE
          AND status != 'cancelled'
        ORDER BY session_date ASC, session_time ASC
      `;
    } else {
      query = sql`
        SELECT
          id,
          title,
          description,
          session_date,
          session_time,
          duration_minutes,
          zoom_link,
          zoom_meeting_id,
          max_participants,
          status,
          program,
          is_recording_available,
          recording_url,
          created_at
        FROM qa_sessions
        WHERE program = 'transformatie'
        ORDER BY session_date DESC, session_time DESC
      `;
    }

    const result = await query;

    // Format sessions for response
    const sessions = result.rows.map((session: any) => ({
      id: session.id,
      title: session.title,
      description: session.description,
      date: session.session_date,
      time: session.session_time,
      durationMinutes: session.duration_minutes,
      zoomLink: session.zoom_link,
      zoomMeetingId: session.zoom_meeting_id,
      maxParticipants: session.max_participants,
      status: session.status,
      program: session.program,
      isRecordingAvailable: session.is_recording_available,
      recordingUrl: includeRecordings ? session.recording_url : undefined,
      createdAt: session.created_at,
    }));

    return NextResponse.json({
      sessions,
      count: sessions.length,
    });

  } catch (error) {
    console.error('Error fetching Q&A sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Q&A sessions' },
      { status: 500 }
    );
  }
}
