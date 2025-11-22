/**
 * ERROR LOGGING API ENDPOINT
 * Receives client-side error logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, RateLimitPresets } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  // Apply rate limiting (prevent spam)
  const rateLimitResponse = await applyRateLimit(request, {
    ...RateLimitPresets.api,
    maxRequests: 10,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const errorLog = await request.json();

    // Validate error log structure
    if (!errorLog.message || !errorLog.severity) {
      return NextResponse.json(
        { error: 'Invalid error log format' },
        { status: 400 }
      );
    }

    // Log to console (in production, send to logging service)
    console.error('CLIENT ERROR:', {
      ...errorLog,
      timestamp: new Date().toISOString(),
      ip: request.ip || request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}
