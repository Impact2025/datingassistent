import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const severity = searchParams.get('severity');
    const eventType = searchParams.get('type');

    let query;
    if (severity && eventType) {
      query = sql`
        SELECT id, event_type, service, operation, message, severity, user_id, created_at
        FROM system_monitoring
        WHERE severity = ${severity} AND event_type = ${eventType}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (severity) {
      query = sql`
        SELECT id, event_type, service, operation, message, severity, user_id, created_at
        FROM system_monitoring
        WHERE severity = ${severity}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (eventType) {
      query = sql`
        SELECT id, event_type, service, operation, message, severity, user_id, created_at
        FROM system_monitoring
        WHERE event_type = ${eventType}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT id, event_type, service, operation, message, severity, user_id, created_at
        FROM system_monitoring
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    const result = await query;

    return NextResponse.json({
      events: result.rows,
      count: result.rows.length,
      limit
    });
  } catch (error: any) {
    // If table doesn't exist, return empty
    if (error.message?.includes('does not exist')) {
      return NextResponse.json({ events: [], count: 0, note: 'Monitoring table not initialized' });
    }
    console.error('Error fetching monitoring events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// Log a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, service, operation, message, severity, metadata, userId } = body;

    if (!type || !service || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sql`
      INSERT INTO system_monitoring (
        event_type, service, operation, message, severity, metadata, user_id, created_at
      ) VALUES (
        ${type},
        ${service},
        ${operation || 'unknown'},
        ${message},
        ${severity || 'low'},
        ${JSON.stringify(metadata || {})},
        ${userId || null},
        NOW()
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error logging monitoring event:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}
