import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { reporterId, targetType, targetId, reason, content } = await request.json();

    if (!reporterId || !targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert report into database
    const result = await sql`
      INSERT INTO community_reports (
        reporter_id,
        target_type,
        target_id,
        reason,
        content,
        status,
        created_at
      )
      VALUES (
        ${reporterId},
        ${targetType},
        ${targetId},
        ${reason},
        ${content || null},
        'pending',
        NOW()
      )
      RETURNING id
    `;

    console.log(`Report created: ${targetType} ${targetId} reported by user ${reporterId} for ${reason}`);

    return NextResponse.json({
      success: true,
      reportId: result.rows[0].id
    }, { status: 200 });

  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    const reports = await sql`
      SELECT
        cr.*,
        u_reporter.name as reporter_name,
        u_reporter.email as reporter_email
      FROM community_reports cr
      JOIN users u_reporter ON cr.reporter_id = u_reporter.id
      WHERE cr.status = ${status}
      ORDER BY cr.created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      reports: reports.rows
    }, { status: 200 });

  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}