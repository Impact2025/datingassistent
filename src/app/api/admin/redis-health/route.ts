/**
 * REDIS HEALTH MONITORING API
 *
 * Provides real-time Redis connection health status, metrics, and recommendations.
 * Admin-only endpoint for monitoring and debugging Redis issues.
 *
 * @route GET /api/admin/redis-health
 * @created 2024-12-25
 */

import { NextResponse } from 'next/server';
import { checkAdminAuth, requireAdmin } from '@/lib/admin-auth';
import { redisManager } from '@/lib/redis/connection-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verify admin authentication
    const auth = await checkAdminAuth();
    if (!requireAdmin(auth)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Perform fresh health check
    await redisManager.checkHealth();

    // Get comprehensive status report
    const report = redisManager.getStatusReport();

    // Format response
    const response = {
      status: report.health.isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      connection: {
        isConnected: report.health.isConnected,
        latencyMs: report.health.latencyMs,
        lastCheck: report.health.lastCheck,
        consecutiveFailures: report.health.consecutiveFailures,
      },
      usage: report.health.connectionInfo ? {
        connectedClients: report.health.connectionInfo.connectedClients,
        maxClients: report.health.connectionInfo.maxClients,
        usagePercentage: report.health.connectionInfo.usagePercentage ?? 0,
        status: getUsageStatus(report.health.connectionInfo.usagePercentage ?? 0),
      } : null,
      memory: report.health.memoryUsage ? {
        usedBytes: report.health.memoryUsage.used,
        usedMB: (report.health.memoryUsage.used / 1024 / 1024).toFixed(2),
        peakBytes: report.health.memoryUsage.peak,
        peakMB: (report.health.memoryUsage.peak / 1024 / 1024).toFixed(2),
        totalBytes: report.health.memoryUsage.total,
        totalMB: (report.health.memoryUsage.total / 1024 / 1024).toFixed(2),
        usagePercentage: report.health.memoryUsage.total > 0
          ? Math.round((report.health.memoryUsage.used / report.health.memoryUsage.total) * 100)
          : 0,
      } : null,
      metrics: {
        totalOperations: report.metrics.totalOperations,
        successfulOperations: report.metrics.successfulOperations,
        failedOperations: report.metrics.failedOperations,
        errorRate: report.metrics.totalOperations > 0
          ? ((report.metrics.failedOperations / report.metrics.totalOperations) * 100).toFixed(2) + '%'
          : '0%',
        cacheHits: report.metrics.cacheHits,
        cacheMisses: report.metrics.cacheMisses,
        cacheHitRatio: (report.cacheHitRatio * 100).toFixed(1) + '%',
        averageLatencyMs: report.metrics.averageLatencyMs.toFixed(2),
        lastError: report.metrics.lastError || null,
        lastErrorTime: report.metrics.lastErrorTime || null,
      },
      recommendations: report.recommendations,
      alert: getAlertLevel(report),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Redis Health] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Get usage status label
 */
function getUsageStatus(percentage: number): string {
  if (percentage >= 90) return 'critical';
  if (percentage >= 80) return 'warning';
  if (percentage >= 70) return 'elevated';
  return 'normal';
}

/**
 * Get overall alert level
 */
function getAlertLevel(report: ReturnType<typeof redisManager.getStatusReport>): {
  level: 'ok' | 'warning' | 'critical';
  message: string;
} {
  // Critical conditions
  if (!report.health.isConnected) {
    return { level: 'critical', message: 'Redis connection is down' };
  }

  if (report.health.connectionInfo?.usagePercentage &&
      report.health.connectionInfo.usagePercentage >= 90) {
    return {
      level: 'critical',
      message: `Connection usage at ${report.health.connectionInfo.usagePercentage}% - immediate action required`,
    };
  }

  if (report.health.consecutiveFailures >= 3) {
    return {
      level: 'critical',
      message: `${report.health.consecutiveFailures} consecutive failures detected`,
    };
  }

  // Warning conditions
  if (report.health.connectionInfo?.usagePercentage &&
      report.health.connectionInfo.usagePercentage >= 70) {
    return {
      level: 'warning',
      message: `Connection usage at ${report.health.connectionInfo.usagePercentage}% - monitor closely`,
    };
  }

  if (report.metrics.failedOperations > report.metrics.successfulOperations * 0.05) {
    return {
      level: 'warning',
      message: 'Error rate exceeds 5%',
    };
  }

  if (report.metrics.averageLatencyMs > 100) {
    return {
      level: 'warning',
      message: `High latency detected: ${report.metrics.averageLatencyMs.toFixed(0)}ms`,
    };
  }

  return { level: 'ok', message: 'All systems operational' };
}

/**
 * POST endpoint to manually trigger health check
 */
export async function POST() {
  try {
    const auth = await checkAdminAuth();
    if (!requireAdmin(auth)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Force a fresh health check
    const health = await redisManager.checkHealth();

    return NextResponse.json({
      success: true,
      message: 'Health check completed',
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Redis Health] POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
