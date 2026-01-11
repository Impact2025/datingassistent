import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Build info
const BUILD_VERSION = process.env.npm_package_version || '2.7.1';
const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const startTime = Date.now();

  const health: Record<string, any> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    build: {
      version: BUILD_VERSION,
      time: BUILD_TIME,
      nodeEnv: process.env.NODE_ENV
    },
    checks: {
      database: { status: 'unknown', responseTime: 0 },
      api: { status: 'healthy', responseTime: 0 },
      serviceWorker: { status: 'unknown', note: 'Client-side only' }
    },
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await sql`SELECT 1 as health_check`;
    health.checks.database = {
      status: 'healthy',
      responseTime: Date.now() - dbStart
    };
  } catch (error: any) {
    health.checks.database = {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now() - startTime
    };
    health.status = 'degraded';
  }

  // Get error stats from last hour
  try {
    const errorStats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
        COUNT(*) FILTER (WHERE severity = 'high') as high_count,
        COUNT(*) FILTER (WHERE event_type = 'error') as error_count,
        COUNT(*) as total_events
      FROM system_monitoring
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `;

    const stats = errorStats.rows[0] || {};
    const errorRate = stats.total_events > 0
      ? ((parseInt(stats.error_count) || 0) / parseInt(stats.total_events)) * 100
      : 0;

    health.errorStats = {
      lastHour: {
        critical: parseInt(stats.critical_count) || 0,
        high: parseInt(stats.high_count) || 0,
        errors: parseInt(stats.error_count) || 0,
        total: parseInt(stats.total_events) || 0,
        errorRate: Math.round(errorRate * 100) / 100
      }
    };

    if (errorRate > 10) health.status = 'degraded';
    if (errorRate > 25 || (parseInt(stats.critical_count) || 0) > 0) {
      health.status = 'unhealthy';
    }
  } catch (error) {
    health.errorStats = { note: 'Stats table not available' };
  }

  // Get active users
  try {
    const activeUsers = await sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE last_login > NOW() - INTERVAL '5 minutes'
    `;
    health.activeUsers = parseInt(activeUsers.rows[0]?.count) || 0;
  } catch (error) {
    health.activeUsers = 0;
  }

  health.responseTime = Date.now() - startTime;
  health.checks.api.responseTime = health.responseTime;

  const httpStatus = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, {
    status: httpStatus,
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
}
