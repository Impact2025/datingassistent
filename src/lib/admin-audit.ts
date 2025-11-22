/**
 * ADMIN AUDIT LOGGING SYSTEM
 * Enterprise-grade audit logging for admin actions
 * Created: 2025-11-21
 * Author: Security & Compliance Specialist
 */

import { sql } from '@vercel/postgres';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: number;
  action: string;
  resource: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  sessionId?: string;
}

export interface AuditQuery {
  userId?: number;
  action?: string;
  resource?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Log an admin action for audit purposes
 */
export async function logAdminAction(
  userId: number,
  action: string,
  resource: string,
  success: boolean,
  details: Record<string, any> = {},
  request?: Request
): Promise<void> {
  try {
    const auditEntry: Omit<AuditLogEntry, 'id'> = {
      timestamp: new Date(),
      userId,
      action,
      resource,
      success,
      ipAddress: getClientIP(request),
      userAgent: request?.headers.get('user-agent') || undefined,
      details,
      sessionId: generateSessionId()
    };

    // Insert into audit log table
    await sql`
      INSERT INTO admin_audit_logs (
        user_id,
        action,
        resource,
        success,
        ip_address,
        user_agent,
        details,
        session_id,
        created_at
      ) VALUES (
        ${auditEntry.userId},
        ${auditEntry.action},
        ${auditEntry.resource},
        ${auditEntry.success},
        ${auditEntry.ipAddress},
        ${auditEntry.userAgent},
        ${JSON.stringify(auditEntry.details)},
        ${auditEntry.sessionId},
        CURRENT_TIMESTAMP
      )
    `;

    // Log critical security events to console
    if (!success || isSecurityEvent(action)) {
      console.log(`🔐 AUDIT [${success ? 'SUCCESS' : 'FAILED'}]: ${action} on ${resource} by user ${userId}`, {
        ip: auditEntry.ipAddress,
        details: auditEntry.details
      });
    }

  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - audit logging failures shouldn't break the main flow
  }
}

/**
 * Query audit logs with filtering and pagination
 */
export async function queryAuditLogs(query: AuditQuery = {}): Promise<{
  logs: AuditLogEntry[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  try {
    const {
      userId,
      action,
      resource,
      success,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = query;

    // Build where conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (userId !== undefined) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    if (action) {
      conditions.push(`action = $${paramIndex}`);
      params.push(action);
      paramIndex++;
    }

    if (resource) {
      conditions.push(`resource = $${paramIndex}`);
      params.push(resource);
      paramIndex++;
    }

    if (success !== undefined) {
      conditions.push(`success = $${paramIndex}`);
      params.push(success);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM admin_audit_logs ${whereClause}`;
    const countResult = await sql.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get logs with pagination
    const logsQuery = `
      SELECT
        id,
        user_id as "userId",
        action,
        resource,
        success,
        ip_address as "ipAddress",
        user_agent as "userAgent",
        details,
        session_id as "sessionId",
        created_at as "timestamp"
      FROM admin_audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const logsResult = await sql.query(logsQuery, params);

    const logs: AuditLogEntry[] = logsResult.rows.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      userId: row.userId,
      action: row.action,
      resource: row.resource,
      success: row.success,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      sessionId: row.sessionId
    }));

    return {
      logs,
      total,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error('Failed to query audit logs:', error);
    throw new Error('Audit log query failed');
  }
}

/**
 * Get audit statistics for dashboard
 */
export async function getAuditStats(
  days: number = 30
): Promise<{
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  topActions: Array<{ action: string; count: number }>;
  recentActivity: AuditLogEntry[];
  securityEvents: AuditLogEntry[];
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get basic stats
    const statsQuery = `
      SELECT
        COUNT(*) as total_actions,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_actions,
        COUNT(CASE WHEN success = false THEN 1 END) as failed_actions
      FROM admin_audit_logs
      WHERE created_at >= $1
    `;

    const statsResult = await sql.query(statsQuery, [startDate]);
    const stats = statsResult.rows[0];

    // Get top actions
    const topActionsQuery = `
      SELECT action, COUNT(*) as count
      FROM admin_audit_logs
      WHERE created_at >= $1
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `;

    const topActionsResult = await sql.query(topActionsQuery, [startDate]);
    const topActions = topActionsResult.rows.map(row => ({
      action: row.action,
      count: parseInt(row.count)
    }));

    // Get recent activity (last 24 hours)
    const recentQuery = `
      SELECT
        id,
        user_id as "userId",
        action,
        resource,
        success,
        ip_address as "ipAddress",
        details,
        created_at as "timestamp"
      FROM admin_audit_logs
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const recentResult = await sql.query(recentQuery);
    const recentActivity: AuditLogEntry[] = recentResult.rows.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      userId: row.userId,
      action: row.action,
      resource: row.resource,
      success: row.success,
      ipAddress: row.ipAddress,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
    }));

    // Get security events (failed actions and sensitive operations)
    const securityQuery = `
      SELECT
        id,
        user_id as "userId",
        action,
        resource,
        success,
        ip_address as "ipAddress",
        details,
        created_at as "timestamp"
      FROM admin_audit_logs
      WHERE created_at >= $1
        AND (success = false OR action IN ('QUERY_EXECUTED', 'USER_CREATED', 'USER_DELETED', 'CRON_JOB_EXECUTED'))
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const securityResult = await sql.query(securityQuery, [startDate]);
    const securityEvents: AuditLogEntry[] = securityResult.rows.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      userId: row.userId,
      action: row.action,
      resource: row.resource,
      success: row.success,
      ipAddress: row.ipAddress,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
    }));

    return {
      totalActions: parseInt(stats.total_actions),
      successfulActions: parseInt(stats.successful_actions),
      failedActions: parseInt(stats.failed_actions),
      topActions,
      recentActivity,
      securityEvents
    };

  } catch (error) {
    console.error('Failed to get audit stats:', error);
    throw new Error('Audit stats retrieval failed');
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getClientIP(request?: Request): string | undefined {
  if (!request) return undefined;

  // Try various headers for IP detection
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');

  return forwarded?.split(',')[0]?.trim() ||
         realIP ||
         cfIP ||
         'unknown';
}

function generateSessionId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isSecurityEvent(action: string): boolean {
  const securityActions = [
    'QUERY_BLOCKED',
    'QUERY_ERROR',
    'LOGIN_FAILED',
    'ADMIN_ACCESS_DENIED',
    'USER_DELETED',
    'CRON_JOB_FAILED'
  ];

  return securityActions.includes(action);
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

export async function initializeAuditTables(): Promise<void> {
  try {
    // Create audit log table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(200) NOT NULL,
        success BOOLEAN NOT NULL DEFAULT false,
        ip_address INET,
        user_agent TEXT,
        details JSONB,
        session_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes separately (PostgreSQL doesn't support inline INDEX in CREATE TABLE)
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_user_id ON admin_audit_logs (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_logs (action)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_resource ON admin_audit_logs (resource)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_logs (created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_success ON admin_audit_logs (success)`;

    // Create composite index for common queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_admin_audit_user_created
      ON admin_audit_logs (user_id, created_at DESC)
    `;

    // Create retention policy (keep logs for 2 years)
    await sql`
      CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
      RETURNS void AS $$
      BEGIN
        DELETE FROM admin_audit_logs
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';
      END;
      $$ LANGUAGE plpgsql;
    `;

    console.log('✅ Admin audit tables initialized');

  } catch (error) {
    console.error('Failed to initialize audit tables:', error);
    // Don't throw - allow app to continue even if audit tables fail
    // Audit logging is important but not critical for app functionality
  }
}

// MIGRATION NOTE: Table initialization moved to src/lib/db/migrations.ts
// Use the migrations system instead of auto-initialization on module load
// This prevents race conditions and provides better control over schema changes

// Uncomment below ONLY if you need immediate initialization in development
// if (process.env.NODE_ENV === 'development') {
//   initializeAuditTables().catch(console.error);
// }