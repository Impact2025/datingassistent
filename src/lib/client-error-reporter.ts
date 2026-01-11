/**
 * Client-Side Error Reporter
 * Captures and reports errors to the monitoring API for live debugging
 */

export interface ErrorReport {
  type: 'error' | 'warning' | 'info';
  service: string;
  operation: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

// Prevent duplicate error reports
const reportedErrors = new Set<string>();
const REPORT_COOLDOWN = 5000; // 5 seconds between same error reports

function getErrorFingerprint(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  return `${message.substring(0, 100)}`;
}

/**
 * Report an error to the monitoring API
 */
export async function reportError(
  error: Error | string,
  context?: {
    service?: string;
    operation?: string;
    severity?: ErrorReport['severity'];
    metadata?: Record<string, any>;
  }
): Promise<void> {
  if (typeof window === 'undefined') return; // Only in browser

  const fingerprint = getErrorFingerprint(error);

  // Prevent duplicate reports
  if (reportedErrors.has(fingerprint)) return;
  reportedErrors.add(fingerprint);
  setTimeout(() => reportedErrors.delete(fingerprint), REPORT_COOLDOWN);

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  const report: ErrorReport = {
    type: 'error',
    service: context?.service || 'client',
    operation: context?.operation || 'unknown',
    message: errorMessage,
    severity: context?.severity || determineSeverity(errorMessage),
    metadata: {
      ...context?.metadata,
      stack: errorStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  };

  try {
    // Send to monitoring API (non-blocking)
    fetch('/api/admin/monitoring/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    }).catch(() => {
      // Silently fail - don't cause more errors
    });
  } catch {
    // Silently fail
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorReporter]', report);
  }
}

/**
 * Report Service Worker errors specifically
 */
export function reportSWError(
  error: Error | string,
  context?: Record<string, any>
): void {
  reportError(error, {
    service: 'service-worker',
    operation: 'registration',
    severity: 'high',
    metadata: {
      ...context,
      swSupported: 'serviceWorker' in navigator
    }
  });
}

/**
 * Report network/fetch errors
 */
export function reportNetworkError(
  url: string,
  error: Error | string,
  context?: Record<string, any>
): void {
  reportError(error, {
    service: 'network',
    operation: 'fetch',
    severity: 'medium',
    metadata: {
      ...context,
      url,
      online: navigator.onLine
    }
  });
}

/**
 * Determine error severity based on message content
 */
function determineSeverity(message: string): ErrorReport['severity'] {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('self is not defined') ||
      lowerMessage.includes('service worker') ||
      lowerMessage.includes('err_failed')) {
    return 'critical';
  }

  if (lowerMessage.includes('network') ||
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('fetch')) {
    return 'high';
  }

  if (lowerMessage.includes('chunk') ||
      lowerMessage.includes('loading')) {
    return 'medium';
  }

  return 'low';
}

/**
 * Setup global error handlers for automatic error reporting
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    reportError(event.error || event.message, {
      service: 'global',
      operation: 'uncaught-error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : String(event.reason);

    reportError(error, {
      service: 'global',
      operation: 'unhandled-rejection'
    });
  });

  // Handle Service Worker errors
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('error', (event) => {
      reportSWError('Service Worker error event', {
        eventType: event.type
      });
    });
  }

  console.log('[ErrorReporter] Global error handlers initialized');
}

/**
 * Get Service Worker diagnostics
 */
export async function getSWDiagnostics(): Promise<{
  supported: boolean;
  registered: boolean;
  registrations: number;
  caches: string[];
  controller: boolean;
}> {
  const diagnostics = {
    supported: 'serviceWorker' in navigator,
    registered: false,
    registrations: 0,
    caches: [] as string[],
    controller: false
  };

  if (!diagnostics.supported) return diagnostics;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    diagnostics.registrations = registrations.length;
    diagnostics.registered = registrations.length > 0;
    diagnostics.controller = !!navigator.serviceWorker.controller;
  } catch {
    // Ignore errors
  }

  try {
    if ('caches' in window) {
      diagnostics.caches = await caches.keys();
    }
  } catch {
    // Ignore errors
  }

  return diagnostics;
}

/**
 * Clear all Service Worker caches and unregister
 */
export async function clearSWAndCaches(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
    }

    return true;
  } catch (error) {
    reportError(error as Error, {
      service: 'service-worker',
      operation: 'clear-caches'
    });
    return false;
  }
}
