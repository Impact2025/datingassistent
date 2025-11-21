import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  timestamp: number;
  userAgent: string;
  url: string;
}

/**
 * Store Core Web Vitals metrics
 * POST /api/analytics/web-vitals
 */
export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalsMetric = await request.json();

    // Validate required fields
    if (!metric.name || typeof metric.value !== 'number' || !metric.id) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Store in database (create table if needed)
    await sql`
      INSERT INTO web_vitals_metrics (
        metric_name,
        metric_value,
        metric_id,
        metric_delta,
        timestamp,
        user_agent,
        page_url,
        created_at
      ) VALUES (
        ${metric.name},
        ${metric.value},
        ${metric.id},
        ${metric.delta || 0},
        ${new Date(metric.timestamp).toISOString()},
        ${metric.userAgent || ''},
        ${metric.url || ''},
        NOW()
      )
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error storing web vitals:', error);
    return NextResponse.json(
      { error: 'Failed to store metrics' },
      { status: 500 }
    );
  }
}

/**
 * Get aggregated web vitals data for admin dashboard
 * GET /api/analytics/web-vitals?period=7d
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get aggregated metrics
    const result = await sql`
      SELECT
        metric_name,
        COUNT(*) as total_measurements,
        AVG(metric_value) as avg_value,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75_value,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95_value
      FROM web_vitals_metrics
      WHERE timestamp >= ${startDate.toISOString()}
      GROUP BY metric_name
      ORDER BY metric_name
    `;

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      metrics: result.rows
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching web vitals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}