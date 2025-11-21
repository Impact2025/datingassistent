/**
 * SECURITY EVENTS API
 * Provides security events for the admin dashboard
 * Created: 2025-11-21
 * Author: Security Specialist
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const severity = searchParams.get('severity');
    const eventType = searchParams.get('eventType');

    // Build query
    let whereConditions = ['se.created_at >= NOW() - INTERVAL \'7 days\''];
    let params: any[] = [];
    let paramIndex = 1;

    if (severity && severity !== 'all') {
      whereConditions.push(`se.severity = $${paramIndex}`);
      params.push(severity);
      paramIndex++;
    }

    if (eventType && eventType !== 'all') {
      whereConditions.push(`se.event_type = $${paramIndex}`);
      params.push(eventType);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get security events with user info
    const eventsQuery = `
      SELECT
        se.id,
        se.event_type as "eventType",
        se.severity,
        se.user_id as "userId",
        se.ip_address as "ipAddress",
        se.user_agent as "userAgent",
        se.details,
        se.created_at as "createdAt",
        u.email as "userEmail",
        u.name as "userName"
      FROM security_events se
      LEFT JOIN users u ON se.user_id = u.id
      ${whereClause}
      ORDER BY se.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const eventsResult = await sql.query(eventsQuery, params);

    const events = eventsResult.rows.map(row => ({
      id: row.id,
      eventType: row.eventType,
      severity: row.severity,
      userId: row.userId,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      createdAt: row.createdAt,
      userEmail: row.userEmail,
      userName: row.userName
    }));

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Security events API error:', error);

    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    );
  }
}