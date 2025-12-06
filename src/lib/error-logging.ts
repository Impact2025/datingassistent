/**
 * PROFESSIONAL ERROR LOGGING SERVICE
 * Centralized error logging with Sentry integration
 * Works in both client and server environments
 * Created: 2025-11-22
 */

import type { NextRequest } from 'next/server';

// Type-safe error logging
export type ErrorLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface ErrorContext {
  user?: {
    id?: string | number;
    email?: string;
    username?: string;
  };
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  };
  extra?: Record<string, any>;
  tags?: Record<string, string | number | boolean>;
  fingerprint?: string[];
}

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Lazy load Sentry only when needed
let Sentry: typeof import('@sentry/nextjs') | null = null;

function getSentry() {
  if (!Sentry && isBrowser) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Sentry = require('@sentry/nextjs');
    } catch (error) {
      console.warn('Sentry not available:', error);
    }
  }
  return Sentry;
}

/**
 * Log an error with optional context
 */
export function logError(
  error: Error | string,
  level: ErrorLevel = 'error',
  context?: ErrorContext
): void {
  const SentryInstance = getSentry();

  // Create error object if string provided
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${level.toUpperCase()}]`, errorObj, context);
  }

  // Send to Sentry if available
  if (SentryInstance) {
    const sentryContext: any = {};

    // Add user context
    if (context?.user) {
      SentryInstance.setUser({
        id: String(context.user.id),
        email: context.user.email,
        username: context.user.username,
      });
    }

    // Add request context
    if (context?.request) {
      sentryContext.request = {
        url: context.request.url,
        method: context.request.method,
        headers: sanitizeHeaders(context.request.headers || {}),
      };
    }

    // Add extra context
    if (context?.extra) {
      sentryContext.extra = context.extra;
    }

    // Add tags
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        SentryInstance.setTag(key, value);
      });
    }

    // Capture exception with context
    SentryInstance.captureException(errorObj, {
      level: level as any,
      contexts: sentryContext,
      fingerprint: context?.fingerprint,
    });
  }
}

/**
 * Log a message (not an error)
 */
export function logMessage(
  message: string,
  level: 'info' | 'warning' | 'debug' = 'info',
  context?: ErrorContext
): void {
  const SentryInstance = getSentry();

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }

  // Send to Sentry if available
  if (SentryInstance) {
    SentryInstance.captureMessage(message, {
      level: level as any,
      tags: context?.tags,
      extra: context?.extra,
    });
  }
}

/**
 * Track API errors with automatic context
 */
export function logAPIError(
  error: Error | string,
  request: NextRequest,
  additionalContext?: Partial<ErrorContext>
): void {
  const context: ErrorContext = {
    ...additionalContext,
    request: {
      url: request.url,
      method: request.method,
      headers: sanitizeHeaders(Object.fromEntries(request.headers.entries())),
    },
    tags: {
      ...additionalContext?.tags,
      api: true,
      endpoint: request.nextUrl.pathname,
    },
  };

  logError(error, 'error', context);
}

/**
 * Track database errors
 */
export function logDatabaseError(
  error: Error | string,
  query?: string,
  params?: any[]
): void {
  const context: ErrorContext = {
    extra: {
      query: sanitizeSQL(query),
      params: sanitizeParams(params),
    },
    tags: {
      database: true,
    },
    fingerprint: ['database-error', query ? sanitizeSQL(query) : 'unknown-query'],
  };

  logError(error, 'error', context);
}

/**
 * Track authentication errors
 */
export function logAuthError(
  error: Error | string,
  userId?: string | number,
  action?: string
): void {
  const context: ErrorContext = {
    user: userId ? { id: String(userId) } : undefined,
    tags: {
      auth: true,
      action: action || 'unknown',
    },
    fingerprint: ['auth-error', action || 'unknown'],
  };

  logError(error, 'warning', context);
}

/**
 * Track security events
 */
export function logSecurityEvent(
  event: string,
  severity: ErrorLevel,
  details?: Record<string, any>
): void {
  const context: ErrorContext = {
    extra: details,
    tags: {
      security: true,
      event,
    },
    fingerprint: ['security-event', event],
  };

  logMessage(`Security event: ${event}`, severity === 'fatal' || severity === 'error' ? 'warning' : 'info', context);
}

/**
 * Track performance issues
 */
export function logPerformanceIssue(
  metric: string,
  value: number,
  threshold: number
): void {
  const context: ErrorContext = {
    extra: {
      metric,
      value,
      threshold,
      exceeded: value > threshold,
    },
    tags: {
      performance: true,
      metric,
    },
  };

  logMessage(`Performance issue: ${metric} = ${value}ms (threshold: ${threshold}ms)`, 'warning', context);
}

/**
 * Set user context globally
 */
export function setUserContext(user: {
  id: string | number;
  email?: string;
  username?: string;
  [key: string]: any;
}): void {
  const SentryInstance = getSentry();

  if (SentryInstance) {
    SentryInstance.setUser({
      id: String(user.id),
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  const SentryInstance = getSentry();

  if (SentryInstance) {
    SentryInstance.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  data?: Record<string, any>
): void {
  const SentryInstance = getSentry();

  if (SentryInstance) {
    SentryInstance.addBreadcrumb({
      message,
      category,
      level: level as any,
      data,
      timestamp: Date.now() / 1000,
    });
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[BREADCRUMB ${category}]`, message, data);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitize headers to remove sensitive data
 */
function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized = { ...headers };
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-csrf-token',
    'set-cookie',
  ];

  sensitiveHeaders.forEach(header => {
    const key = Object.keys(sanitized).find(k => k.toLowerCase() === header);
    if (key) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitize SQL queries
 */
function sanitizeSQL(query?: string): string {
  if (!query) return 'No query provided';

  return query
    .replace(/password\s*=\s*'[^']*'/gi, "password='[REDACTED]'")
    .replace(/token\s*=\s*'[^']*'/gi, "token='[REDACTED]'")
    .replace(/secret\s*=\s*'[^']*'/gi, "secret='[REDACTED]'");
}

/**
 * Sanitize SQL params
 */
function sanitizeParams(params?: any[]): any[] {
  if (!params) return [];

  return params.map((param, index) => {
    if (typeof param === 'string') {
      // Check if it looks like sensitive data
      const lowerParam = param.toLowerCase();
      if (lowerParam.includes('password') ||
          lowerParam.includes('token') ||
          lowerParam.includes('secret') ||
          lowerParam.length > 50) { // Long strings might be tokens
        return '[REDACTED]';
      }
    }
    return param;
  });
}
