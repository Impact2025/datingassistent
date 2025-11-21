/**
 * Production Monitoring & Alerting System
 *
 * This module provides comprehensive monitoring, logging, and alerting
 * capabilities for production deployments.
 */

import { sql } from '@vercel/postgres';

export interface MonitoringEvent {
  type: 'error' | 'warning' | 'info' | 'performance';
  service: string;
  operation: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  lastChecked: Date;
}

class MonitoringService {
  private events: MonitoringEvent[] = [];
  private healthChecks: SystemHealth[] = [];

  /**
   * Log a monitoring event
   */
  async logEvent(event: MonitoringEvent): Promise<void> {
    const fullEvent: MonitoringEvent = {
      ...event,
      timestamp: event.timestamp || new Date()
    };

    this.events.push(fullEvent);

    // Store in database for persistence
    try {
      await sql`
        INSERT INTO system_monitoring (
          event_type,
          service,
          operation,
          message,
          metadata,
          user_id,
          severity,
          created_at
        ) VALUES (
          ${event.type},
          ${event.service},
          ${event.operation},
          ${event.message},
          ${JSON.stringify(event.metadata || {})},
          ${event.userId || null},
          ${event.severity},
          ${fullEvent.timestamp?.toISOString()}
        )
      `;
    } catch (error) {
      console.error('Failed to store monitoring event:', error);
    }

    // Handle critical alerts
    if (event.severity === 'critical') {
      await this.handleCriticalAlert(fullEvent);
    }

    // Keep only recent events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500);
    }
  }

  /**
   * Log an error with context
   */
  async logError(
    service: string,
    operation: string,
    error: Error,
    metadata?: Record<string, any>,
    userId?: number
  ): Promise<void> {
    await this.logEvent({
      type: 'error',
      service,
      operation,
      message: error.message,
      metadata: {
        ...metadata,
        stack: error.stack,
        name: error.name
      },
      userId,
      severity: this.determineSeverity(error)
    });
  }

  /**
   * Log performance metrics
   */
  async logPerformance(
    service: string,
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
    userId?: number
  ): Promise<void> {
    const severity = duration > 10000 ? 'high' : duration > 5000 ? 'medium' : 'low';

    await this.logEvent({
      type: 'performance',
      service,
      operation,
      message: `Operation took ${duration}ms`,
      metadata: {
        ...metadata,
        duration
      },
      userId,
      severity
    });
  }

  /**
   * Perform system health check
   */
  async performHealthCheck(): Promise<SystemHealth> {
    const startTime = Date.now();

    try {
      // Check database connectivity
      const dbStart = Date.now();
      await sql`SELECT 1 as health_check`;
      const dbResponseTime = Date.now() - dbStart;

      // Get active users (last 5 minutes)
      const activeUsers = await sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE last_login > NOW() - INTERVAL '5 minutes'
      `;

      // Get error rate (last hour)
      const errorCount = await sql`
        SELECT COUNT(*) as count
        FROM system_monitoring
        WHERE event_type = 'error'
          AND severity IN ('high', 'critical')
          AND created_at > NOW() - INTERVAL '1 hour'
      `;

      const totalRequests = await sql`
        SELECT COUNT(*) as count
        FROM system_monitoring
        WHERE created_at > NOW() - INTERVAL '1 hour'
      `;

      const responseTime = Date.now() - startTime;
      const errorRate = totalRequests.rows[0]?.count > 0
        ? (errorCount.rows[0]?.count / totalRequests.rows[0]?.count) * 100
        : 0;

      // Determine status
      let status: SystemHealth['status'] = 'healthy';
      if (errorRate > 5 || responseTime > 5000) {
        status = 'degraded';
      }
      if (errorRate > 15 || responseTime > 10000) {
        status = 'unhealthy';
      }

      const health: SystemHealth = {
        status,
        uptime: process.uptime(),
        responseTime,
        errorRate,
        activeUsers: parseInt(activeUsers.rows[0]?.count || '0'),
        lastChecked: new Date()
      };

      this.healthChecks.push(health);

      // Alert on status changes
      if (status !== 'healthy') {
        await this.logEvent({
          type: 'warning',
          service: 'system',
          operation: 'health_check',
          message: `System health status: ${status}`,
          metadata: health,
          severity: status === 'unhealthy' ? 'critical' : 'high'
        });
      }

      return health;

    } catch (error) {
      const health: SystemHealth = {
        status: 'unhealthy',
        uptime: process.uptime(),
        responseTime: Date.now() - startTime,
        errorRate: 100,
        activeUsers: 0,
        lastChecked: new Date()
      };

      await this.logError('system', 'health_check', error as Error);
      return health;
    }
  }

  /**
   * Get monitoring statistics
   */
  async getStats(timeframe: 'hour' | 'day' | 'week' = 'hour') {
    const interval = timeframe === 'hour' ? '1 hour' : timeframe === 'day' ? '1 day' : '1 week';

    const stats = await sql`
      SELECT
        event_type,
        severity,
        COUNT(*) as count
      FROM system_monitoring
      WHERE created_at > NOW() - INTERVAL ${interval}
      GROUP BY event_type, severity
      ORDER BY event_type, severity
    `;

    const performanceStats = await sql`
      SELECT
        service,
        operation,
        AVG((metadata->>'duration')::float) as avg_duration,
        MAX((metadata->>'duration')::float) as max_duration,
        COUNT(*) as count
      FROM system_monitoring
      WHERE event_type = 'performance'
        AND created_at > NOW() - INTERVAL ${interval}
        AND metadata->>'duration' IS NOT NULL
      GROUP BY service, operation
      ORDER BY avg_duration DESC
    `;

    return {
      events: stats.rows,
      performance: performanceStats.rows,
      timeframe
    };
  }

  /**
   * Handle critical alerts (email, SMS, etc.)
   */
  private async handleCriticalAlert(event: MonitoringEvent): Promise<void> {
    console.error('🚨 CRITICAL ALERT:', event);

    // In production, this would send emails/SMS to administrators
    // For now, just log to console with enhanced visibility

    const alertMessage = `
🚨 CRITICAL SYSTEM ALERT 🚨

Service: ${event.service}
Operation: ${event.operation}
Message: ${event.message}
Severity: ${event.severity}
Time: ${event.timestamp?.toISOString()}

Metadata: ${JSON.stringify(event.metadata, null, 2)}

Please investigate immediately!
    `.trim();

    console.error(alertMessage);

    // Store alert in database
    try {
      await sql`
        INSERT INTO system_alerts (
          alert_type,
          severity,
          message,
          metadata,
          resolved,
          created_at
        ) VALUES (
          'critical_system_event',
          ${event.severity},
          ${alertMessage},
          ${JSON.stringify(event)},
          false,
          NOW()
        )
      `;
    } catch (error) {
      console.error('Failed to store critical alert:', error);
    }
  }

  /**
   * Determine severity based on error type
   */
  private determineSeverity(error: Error): MonitoringEvent['severity'] {
    const message = error.message.toLowerCase();

    if (message.includes('database') || message.includes('connection')) {
      return 'critical';
    }
    if (message.includes('timeout') || message.includes('rate limit')) {
      return 'high';
    }
    if (message.includes('validation') || message.includes('unauthorized')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 50): MonitoringEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get recent health checks
   */
  getRecentHealthChecks(limit: number = 10): SystemHealth[] {
    return this.healthChecks.slice(-limit);
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Helper functions for easy logging
export const logError = (service: string, operation: string, error: Error, metadata?: Record<string, any>, userId?: number) =>
  monitoring.logError(service, operation, error, metadata, userId);

export const logPerformance = (service: string, operation: string, duration: number, metadata?: Record<string, any>, userId?: number) =>
  monitoring.logPerformance(service, operation, duration, metadata, userId);

export const logEvent = (event: MonitoringEvent) =>
  monitoring.logEvent(event);

export const performHealthCheck = () =>
  monitoring.performHealthCheck();