import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'healthy' | 'unhealthy';
    memory: 'healthy' | 'warning' | 'critical';
    response_time: 'healthy' | 'warning' | 'critical';
  };
  metrics?: {
    active_connections?: number;
    memory_usage_mb?: number;
    response_time_ms?: number;
  };
}

const START_TIME = Date.now();

/**
 * Health check endpoint for monitoring and load balancers
 * GET /api/health
 * GET /api/health?detailed=true for full metrics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const detailed = searchParams.get('detailed') === 'true';

  try {
    // Check database connectivity
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    let activeConnections = 0;

    try {
      const dbResult = await sql`SELECT COUNT(*) as connections FROM pg_stat_activity`;
      activeConnections = parseInt(dbResult.rows[0]?.connections || '0');
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      dbStatus = 'unhealthy';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memoryStatus = memoryUsageMB > 500 ? 'critical' :
                        memoryUsageMB > 200 ? 'warning' : 'healthy';

    // Response time check
    const responseTime = Date.now() - startTime;
    const responseTimeStatus = responseTime > 1000 ? 'critical' :
                              responseTime > 500 ? 'warning' : 'healthy';

    // Overall status determination
    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
      dbStatus === 'unhealthy' || responseTimeStatus === 'critical' ? 'unhealthy' :
      memoryStatus === 'critical' || responseTimeStatus === 'warning' ? 'degraded' :
      'healthy';

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbStatus,
        memory: memoryStatus,
        response_time: responseTimeStatus,
      },
    };

    if (detailed) {
      healthStatus.metrics = {
        active_connections: activeConnections,
        memory_usage_mb: memoryUsageMB,
        response_time_ms: responseTime,
      };
    }

    const statusCode = overallStatus === 'healthy' ? 200 :
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Health check error:', error);

    const errorHealthStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unhealthy',
        memory: 'critical',
        response_time: 'critical',
      },
    };

    return NextResponse.json(errorHealthStatus, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * Readiness check - for Kubernetes/Docker health checks
 * GET /api/health/ready
 */
export async function HEAD(request: NextRequest) {
  try {
    // Quick database connectivity check
    await sql`SELECT 1`;

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}