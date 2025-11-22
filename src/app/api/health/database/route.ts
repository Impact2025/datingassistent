/**
 * DATABASE HEALTH CHECK ENDPOINT
 * Monitor database connectivity, performance, and schema integrity
 * GET /api/health/database
 */

import { NextResponse } from 'next/server';
import {
  checkDatabaseConnection,
  getDatabaseStats,
  validateDatabaseSchema,
  runMigrations,
} from '@/lib/db/migrations';
import { measureDatabaseQuery } from '@/lib/performance-monitoring';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Database queries need Node.js runtime

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    connection: {
      status: 'pass' | 'fail';
      responseTime?: number;
    };
    schema: {
      status: 'pass' | 'fail';
      issues?: string[];
    };
    stats?: {
      tables: any[];
      indexes: any[];
    };
  };
  migrations?: {
    pending: boolean;
    lastRun?: string[];
  };
}

/**
 * GET /api/health/database
 * Check database health status
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Check database connection
    const connectionResult = await measureDatabaseQuery('health-check', async () => {
      return await checkDatabaseConnection();
    });

    const connectionTime = Date.now() - startTime;

    // Check schema validity
    const schemaValidation = await validateDatabaseSchema();

    // Get database statistics (optional, might be slow)
    const url = new URL(request.url);
    const includeStats = url.searchParams.get('stats') === 'true';

    let stats = undefined;
    if (includeStats) {
      stats = await getDatabaseStats();
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (!connectionResult) {
      status = 'unhealthy';
    } else if (!schemaValidation.valid) {
      status = 'degraded';
    } else if (connectionTime > 1000) {
      status = 'degraded'; // Connection took > 1 second
    }

    const response: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        connection: {
          status: connectionResult ? 'pass' : 'fail',
          responseTime: connectionTime,
        },
        schema: {
          status: schemaValidation.valid ? 'pass' : 'fail',
          issues: schemaValidation.valid ? undefined : schemaValidation.issues,
        },
        stats,
      },
    };

    // Return appropriate HTTP status code
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    return NextResponse.json(response, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    const response: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        connection: {
          status: 'fail',
        },
        schema: {
          status: 'fail',
          issues: [error instanceof Error ? error.message : 'Unknown error'],
        },
      },
    };

    return NextResponse.json(response, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  }
}

/**
 * POST /api/health/database
 * Run database migrations
 * (Admin only - should be protected)
 */
export async function POST() {
  try {
    // Run migrations
    const result = await runMigrations();

    return NextResponse.json({
      success: result.success,
      migrationsRun: result.migrationsRun,
      errors: result.errors,
      duration: result.duration,
    }, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error('Migration failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 500,
    });
  }
}
