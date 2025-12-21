/**
 * API: Admin Q&A Sessions Management
 *
 * POST   /api/admin/qa-sessions - Create new Q&A session
 * GET    /api/admin/qa-sessions - Get all sessions (admin view)
 *
 * Admin only - requires role = 'admin'
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET - List all Q&A sessions (admin view)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const result = await sql`
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
        created_at,
        updated_at
      FROM qa_sessions
      ORDER BY session_date DESC, session_time DESC
    `;

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
      recordingUrl: session.recording_url,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    }));

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Error fetching Q&A sessions (admin):', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Create new Q&A session
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      time,
      durationMinutes = 60,
      zoomLink,
      zoomMeetingId,
      maxParticipants = 100,
      status = 'scheduled',
      program = 'transformatie',
    } = body;

    // Validation
    if (!title || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date, time' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM or HH:MM:SS' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO qa_sessions (
        title,
        description,
        session_date,
        session_time,
        duration_minutes,
        zoom_link,
        zoom_meeting_id,
        max_participants,
        status,
        program
      ) VALUES (
        ${title},
        ${description || null},
        ${date},
        ${time},
        ${durationMinutes},
        ${zoomLink || null},
        ${zoomMeetingId || null},
        ${maxParticipants},
        ${status},
        ${program}
      )
      RETURNING *
    `;

    const session = result.rows[0];

    return NextResponse.json({
      message: 'Q&A session created successfully',
      session: {
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
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Q&A session:', error);
    return NextResponse.json(
      { error: 'Failed to create Q&A session' },
      { status: 500 }
    );
  }
}
