import { NextRequest, NextResponse } from 'next/server';
import { performHealthCheck, monitoring } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const health = await performHealthCheck();

    // Return appropriate HTTP status based on health
    const statusCode = health.status === 'healthy' ? 200 :
                      health.status === 'degraded' ? 200 : 503; // unhealthy

    return NextResponse.json({
      status: health.status,
      uptime: health.uptime,
      responseTime: health.responseTime,
      errorRate: health.errorRate,
      activeUsers: health.activeUsers,
      lastChecked: health.lastChecked,
      timestamp: new Date().toISOString()
    }, { status: statusCode });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}