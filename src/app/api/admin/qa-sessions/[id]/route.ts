/**
 * API: Admin Q&A Session Management (Single Session)
 *
 * PUT    /api/admin/qa-sessions/[id] - Update session
 * DELETE /api/admin/qa-sessions/[id] - Delete session
 *
 * Admin only - requires role = 'admin'
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// PUT - Update Q&A session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const sessionId = parseInt(params.id);
    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      time,
      durationMinutes,
      zoomLink,
      zoomMeetingId,
      maxParticipants,
      status,
      isRecordingAvailable,
      recordingUrl,
    } = body;

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (date !== undefined) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }
      updates.push(`session_date = $${paramCount++}`);
      values.push(date);
    }
    if (time !== undefined) {
      // Validate time format
      const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
      if (!timeRegex.test(time)) {
        return NextResponse.json(
          { error: 'Invalid time format. Use HH:MM or HH:MM:SS' },
          { status: 400 }
        );
      }
      updates.push(`session_time = $${paramCount++}`);
      values.push(time);
    }
    if (durationMinutes !== undefined) {
      updates.push(`duration_minutes = $${paramCount++}`);
      values.push(durationMinutes);
    }
    if (zoomLink !== undefined) {
      updates.push(`zoom_link = $${paramCount++}`);
      values.push(zoomLink);
    }
    if (zoomMeetingId !== undefined) {
      updates.push(`zoom_meeting_id = $${paramCount++}`);
      values.push(zoomMeetingId);
    }
    if (maxParticipants !== undefined) {
      updates.push(`max_participants = $${paramCount++}`);
      values.push(maxParticipants);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (isRecordingAvailable !== undefined) {
      updates.push(`is_recording_available = $${paramCount++}`);
      values.push(isRecordingAvailable);
    }
    if (recordingUrl !== undefined) {
      updates.push(`recording_url = $${paramCount++}`);
      values.push(recordingUrl);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);

    // Add session ID
    values.push(sessionId);

    const query = `
      UPDATE qa_sessions
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = result.rows[0];

    return NextResponse.json({
      message: 'Session updated successfully',
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
        isRecordingAvailable: session.is_recording_available,
        recordingUrl: session.recording_url,
        updatedAt: session.updated_at,
      },
    });

  } catch (error) {
    console.error('Error updating Q&A session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Q&A session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const sessionId = parseInt(params.id);
    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM qa_sessions
      WHERE id = ${sessionId}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Session deleted successfully',
      sessionId,
    });

  } catch (error) {
    console.error('Error deleting Q&A session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
