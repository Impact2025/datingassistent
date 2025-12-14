/**
 * HEALTH CHECK ENDPOINT
 * Production monitoring and uptime checks
 */

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
    checks: {
      database: 'ok',
      api: 'ok',
    },
  };

  try {
    await sql`SELECT 1 as health_check`;
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  });
}
