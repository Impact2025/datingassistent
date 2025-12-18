/**
 * ERROR LOGGING UTILITY
 * Centralized error handling and logging
 * Created: 2025-11-22
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorLogContext {
  userId?: number;
  userEmail?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  error?: Error;
  context?: ErrorLogContext;
  digest?: string;
  userAgent?: string;
  url?: string;
}

/**
 * Log an error with context
 */
export function logError(
  error: Error | string,
  severity: ErrorSeverity = 'medium',
  context?: ErrorLogContext
): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  const log: ErrorLog = {
    message: errorMessage,
    severity,
    timestamp: new Date().toISOString(),
    error: typeof error === 'string' ? undefined : error,
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // Console logging with severity-based formatting
  const emoji = {
    low: '📝',
    medium: '⚠️ ',
    high: '🔴',
    critical: '🚨',
  }[severity];

  console.error(emoji + ' ERROR:', {
    message: errorMessage,
    severity,
    context,
    stack: errorStack,
  });

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Sentry, LogRocket, etc.
    sendToErrorTracking(log);
  }

  // Store in localStorage for debugging (development only)
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    try {
      const recentErrors = JSON.parse(localStorage.getItem('dev_errors') || '[]');
      recentErrors.unshift(log);
      // Keep only last 50 errors
      localStorage.setItem('dev_errors', JSON.stringify(recentErrors.slice(0, 50)));
    } catch (e) {
      // Silent fail
    }
  }
}

/**
 * Error tracking configuration
 * Set NEXT_PUBLIC_SENTRY_DSN in environment to enable Sentry
 */
const errorTrackingConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sentryDSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
};

/**
 * Initialize error tracking (call once at app start)
 * Ready for Sentry integration - just add @sentry/nextjs package
 */
export async function initErrorTracking() {
  if (!errorTrackingConfig.enabled) {
    console.log('📊 Error tracking disabled in development');
    return;
  }

  if (errorTrackingConfig.sentryDSN) {
    // Sentry will be initialized here when package is added
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.init({
    //   dsn: errorTrackingConfig.sentryDSN,
    //   environment: errorTrackingConfig.environment,
    //   release: errorTrackingConfig.release,
    //   tracesSampleRate: 0.1,
    //   replaysSessionSampleRate: 0.1,
    //   replaysOnErrorSampleRate: 1.0,
    // });
    console.log('🔍 Sentry error tracking ready (add @sentry/nextjs to enable)');
  }
}

/**
 * Send error to tracking service
 * Sentry-ready implementation
 */
function sendToErrorTracking(log: ErrorLog): void {
  // Sentry integration (when @sentry/nextjs is installed)
  // if (errorTrackingConfig.sentryDSN && typeof Sentry !== 'undefined') {
  //   Sentry.captureException(log.error || new Error(log.message), {
  //     level: log.severity === 'critical' ? 'fatal' : log.severity === 'high' ? 'error' : 'warning',
  //     tags: {
  //       route: log.context?.route,
  //       action: log.context?.action,
  //     },
  //     user: log.context?.userId ? { id: String(log.context.userId), email: log.context.userEmail } : undefined,
  //     extra: log.context?.metadata,
  //   });
  //   return;
  // }

  // Fallback: Send to custom API endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...log,
        error: log.error ? { message: log.error.message, stack: log.error.stack } : undefined,
      }),
    }).catch(() => {
      // Silent fail - don't want error logging to cause more errors
    });
  }
}

/**
 * Log API errors specifically
 */
export function logAPIError(
  endpoint: string,
  error: Error | string,
  statusCode?: number,
  context?: ErrorLogContext
): void {
  logError(error, statusCode && statusCode >= 500 ? 'high' : 'medium', {
    ...context,
    action: 'api_call',
    metadata: {
      ...context?.metadata,
      endpoint,
      statusCode,
    },
  });
}

/**
 * Log authentication errors
 */
export function logAuthError(
  error: Error | string,
  context?: ErrorLogContext
): void {
  logError(error, 'high', {
    ...context,
    action: 'authentication',
  });
}

/**
 * Log payment errors (critical!)
 */
export function logPaymentError(
  error: Error | string,
  context?: ErrorLogContext
): void {
  logError(error, 'critical', {
    ...context,
    action: 'payment',
  });
}

/**
 * Get recent errors (development only)
 */
export function getRecentErrors(): ErrorLog[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem('dev_errors') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear error log (development only)
 */
export function clearErrorLog(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dev_errors');
  }
}

/**
 * React hook for error handling
 */
export function useErrorHandler() {
  const handleError = (error: Error | string, context?: ErrorLogContext) => {
    logError(error, 'medium', context);
  };

  return { handleError, logError, logAPIError, logAuthError, logPaymentError };
}
