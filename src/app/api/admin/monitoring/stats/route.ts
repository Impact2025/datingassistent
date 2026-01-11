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
    const timeframe = searchParams.get('timeframe') || 'hour';

    // Use different queries based on timeframe to avoid SQL injection
    let eventStats, performanceStats;

    if (timeframe === 'hour') {
      eventStats = await sql`
        SELECT event_type, severity, COUNT(*) as count
        FROM system_monitoring
        WHERE created_at > NOW() - INTERVAL '1 hour'
        GROUP BY event_type, severity
        ORDER BY event_type, severity
      `;
      performanceStats = await sql`
        SELECT service, operation,
          AVG((metadata->>'duration')::float) as avg_duration,
          MAX((metadata->>'duration')::float) as max_duration,
          COUNT(*) as count
        FROM system_monitoring
        WHERE event_type = 'performance'
          AND created_at > NOW() - INTERVAL '1 hour'
          AND metadata->>'duration' IS NOT NULL
        GROUP BY service, operation
        ORDER BY avg_duration DESC
        LIMIT 20
      `;
    } else if (timeframe === 'day') {
      eventStats = await sql`
        SELECT event_type, severity, COUNT(*) as count
        FROM system_monitoring
        WHERE created_at > NOW() - INTERVAL '1 day'
        GROUP BY event_type, severity
        ORDER BY event_type, severity
      `;
      performanceStats = await sql`
        SELECT service, operation,
          AVG((metadata->>'duration')::float) as avg_duration,
          MAX((metadata->>'duration')::float) as max_duration,
          COUNT(*) as count
        FROM system_monitoring
        WHERE event_type = 'performance'
          AND created_at > NOW() - INTERVAL '1 day'
          AND metadata->>'duration' IS NOT NULL
        GROUP BY service, operation
        ORDER BY avg_duration DESC
        LIMIT 20
      `;
    } else {
      eventStats = await sql`
        SELECT event_type, severity, COUNT(*) as count
        FROM system_monitoring
        WHERE created_at > NOW() - INTERVAL '1 week'
        GROUP BY event_type, severity
        ORDER BY event_type, severity
      `;
      performanceStats = await sql`
        SELECT service, operation,
          AVG((metadata->>'duration')::float) as avg_duration,
          MAX((metadata->>'duration')::float) as max_duration,
          COUNT(*) as count
        FROM system_monitoring
        WHERE event_type = 'performance'
          AND created_at > NOW() - INTERVAL '1 week'
          AND metadata->>'duration' IS NOT NULL
        GROUP BY service, operation
        ORDER BY avg_duration DESC
        LIMIT 20
      `;
    }

    // Hourly breakdown for charts (always 24 hours)
    const hourlyBreakdown = await sql`
      SELECT
        DATE_TRUNC('hour', created_at) as hour,
        event_type,
        COUNT(*) as count
      FROM system_monitoring
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', created_at), event_type
      ORDER BY hour DESC
    `;

    return NextResponse.json({
      events: eventStats.rows,
      performance: performanceStats.rows,
      hourlyBreakdown: hourlyBreakdown.rows,
      timeframe
    });
  } catch (error: any) {
    // If table doesn't exist, return empty stats
    if (error.message?.includes('does not exist')) {
      return NextResponse.json({
        events: [],
        performance: [],
        hourlyBreakdown: [],
        note: 'Monitoring table not initialized'
      });
    }
    console.error('Error fetching monitoring stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
