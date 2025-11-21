/**
 * AUDIT LOGS API
 * Provides audit logs for the admin dashboard
 * Created: 2025-11-21
 * Author: Security Specialist
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { queryAuditLogs } from '@/lib/admin-audit';

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;
    const action = searchParams.get('action') || undefined;
    const resource = searchParams.get('resource') || undefined;
    const success = searchParams.get('success') === 'true' ? true :
                   searchParams.get('success') === 'false' ? false : undefined;

    // Query audit logs
    const result = await queryAuditLogs({
      userId,
      action,
      resource,
      success,
      limit,
      offset
    });

    // Transform to dashboard format
    const logs = result.logs.map(log => ({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      success: log.success,
      ipAddress: log.ipAddress || '',
      createdAt: log.timestamp.toISOString(),
      userEmail: '', // Would need to join with users table
      userName: ''   // Would need to join with users table
    }));

    return NextResponse.json({
      logs,
      pagination: result.pagination,
      total: result.total
    });

  } catch (error) {
    console.error('Audit logs API error:', error);

    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}