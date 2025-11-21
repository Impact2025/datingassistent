/**
 * SECURITY STATS API
 * Provides security statistics for the admin dashboard
 * Created: 2025-11-21
 * Author: Security Specialist
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAuditStats } from '@/lib/admin-audit';

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin(request);

    // Get audit statistics
    const stats = await getAuditStats(24); // Last 24 hours

    // Transform to dashboard format
    const dashboardStats = {
      totalAdminActions: stats.totalActions,
      failedActions: stats.failedActions,
      securityEventsToday: stats.securityEvents.length,
      blockedRequests: 0, // Would come from rate limiting stats
      activeAdminSessions: 0 // Would come from session tracking
    };

    return NextResponse.json(dashboardStats);

  } catch (error) {
    console.error('Security stats API error:', error);

    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch security stats' },
      { status: 500 }
    );
  }
}