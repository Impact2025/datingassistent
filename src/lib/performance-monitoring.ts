/**
 * PERFORMANCE MONITORING SERVICE
 * Track and monitor application performance with Sentry
 * Web Vitals, API response times, database queries, etc.
 * Created: 2025-11-22
 */

import { logPerformanceIssue, addBreadcrumb } from './error-logging';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Lazy load Sentry
let Sentry: typeof import('@sentry/nextjs') | null = null;

function getSentry() {
  if (!Sentry && isBrowser) {
    try {
      Sentry = require('@sentry/nextjs');
    } catch (error) {
      console.warn('Sentry not available for performance monitoring');
    }
  }
  return Sentry;
}

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  pageLoad: 3000, // 3 seconds
  apiCall: 2000, // 2 seconds
  databaseQuery: 1000, // 1 second
  rendering: 500, // 500ms
  interaction: 100, // 100ms (for click, input, etc.)
};

/**
 * Track page load performance
 */
export function trackPageLoad(): void {
  if (!isBrowser) return;

  // Use Performance API
  if (window.performance && window.performance.getEntriesByType) {
    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart, // Time to First Byte
        download: navigation.responseEnd - navigation.responseStart,
        domProcessing: navigation.domComplete - navigation.domInteractive,
        total: navigation.loadEventEnd - navigation.fetchStart,
      };

      // Log to Sentry
      addBreadcrumb('Page Load Metrics', 'performance', 'info', metrics);

      // Check thresholds
      if (metrics.total > PERFORMANCE_THRESHOLDS.pageLoad) {
        logPerformanceIssue('page-load', metrics.total, PERFORMANCE_THRESHOLDS.pageLoad);
      }
    }
  }
}

/**
 * Track Web Vitals (LCP, FID, CLS, FCP, TTFB)
 */
export function trackWebVitals(metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}): void {
  const SentryInstance = getSentry();

  if (SentryInstance) {
    // Send to Sentry as measurement
    SentryInstance.setMeasurement(metric.name, metric.value, 'millisecond');

    // Add breadcrumb
    addBreadcrumb(`Web Vital: ${metric.name}`, 'web-vitals', 'info', {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });

    // Log poor ratings
    if (metric.rating === 'poor') {
      logPerformanceIssue(
        metric.name,
        metric.value,
        metric.name === 'CLS' ? 0.25 : 2500 // CLS has different threshold
      );
    }
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, metric);
  }
}

/**
 * Measure API call performance
 */
export async function measureAPICall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const SentryInstance = getSentry();

  // Start Sentry transaction if available
  const transaction = SentryInstance?.startTransaction({
    name: `API Call: ${name}`,
    op: 'http.client',
  });

  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;

    // Record success
    if (transaction) {
      transaction.setStatus('ok');
      transaction.finish();
    }

    // Add breadcrumb
    addBreadcrumb(`API Call: ${name}`, 'api', 'info', {
      duration,
      status: 'success',
    });

    // Check threshold
    if (duration > PERFORMANCE_THRESHOLDS.apiCall) {
      logPerformanceIssue(`api-${name}`, duration, PERFORMANCE_THRESHOLDS.apiCall);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Record failure
    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }

    // Add breadcrumb
    addBreadcrumb(`API Call Failed: ${name}`, 'api', 'error', {
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Measure database query performance
 */
export async function measureDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const SentryInstance = getSentry();

  // Start Sentry span if available
  const transaction = SentryInstance?.startTransaction({
    name: `DB Query: ${queryName}`,
    op: 'db.sql',
  });

  try {
    const result = await query();
    const duration = Date.now() - startTime;

    // Record success
    if (transaction) {
      transaction.setStatus('ok');
      transaction.setMeasurement('db.query.duration', duration, 'millisecond');
      transaction.finish();
    }

    // Add breadcrumb
    addBreadcrumb(`DB Query: ${queryName}`, 'database', 'info', {
      duration,
      status: 'success',
    });

    // Check threshold
    if (duration > PERFORMANCE_THRESHOLDS.databaseQuery) {
      logPerformanceIssue(`db-${queryName}`, duration, PERFORMANCE_THRESHOLDS.databaseQuery);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Record failure
    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }

    // Add breadcrumb
    addBreadcrumb(`DB Query Failed: ${queryName}`, 'database', 'error', {
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Measure component rendering performance
 */
export function measureRender(componentName: string, duration: number): void {
  addBreadcrumb(`Component Render: ${componentName}`, 'render', 'debug', {
    duration,
  });

  // Check threshold
  if (duration > PERFORMANCE_THRESHOLDS.rendering) {
    logPerformanceIssue(`render-${componentName}`, duration, PERFORMANCE_THRESHOLDS.rendering);
  }
}

/**
 * Measure user interaction performance (click, input, etc.)
 */
export function measureInteraction(
  interactionType: string,
  elementName: string,
  duration: number
): void {
  addBreadcrumb(`User Interaction: ${interactionType}`, 'interaction', 'debug', {
    element: elementName,
    duration,
  });

  // Check threshold
  if (duration > PERFORMANCE_THRESHOLDS.interaction) {
    logPerformanceIssue(
      `interaction-${interactionType}-${elementName}`,
      duration,
      PERFORMANCE_THRESHOLDS.interaction
    );
  }
}

/**
 * Track custom metric
 */
export function trackCustomMetric(
  name: string,
  value: number,
  unit: 'millisecond' | 'byte' | 'none' = 'none'
): void {
  const SentryInstance = getSentry();

  if (SentryInstance) {
    SentryInstance.setMeasurement(name, value, unit);
  }

  addBreadcrumb(`Custom Metric: ${name}`, 'metric', 'info', {
    value,
    unit,
  });
}

/**
 * Start a manual performance span
 */
export function startPerformanceSpan(name: string, op: string = 'function') {
  const SentryInstance = getSentry();

  if (SentryInstance) {
    return SentryInstance.startTransaction({
      name,
      op,
    });
  }

  // Fallback: manual timing
  const startTime = Date.now();

  return {
    finish: () => {
      const duration = Date.now() - startTime;
      addBreadcrumb(`Performance Span: ${name}`, 'performance', 'info', {
        duration,
        op,
      });
    },
    setStatus: () => {},
    setMeasurement: () => {},
  };
}

/**
 * Report long tasks (blocking the main thread)
 */
export function observeLongTasks(): void {
  if (!isBrowser) return;

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks over 50ms
            addBreadcrumb('Long Task Detected', 'performance', 'warning', {
              duration: entry.duration,
              name: entry.name,
            });

            if (entry.duration > 200) {
              logPerformanceIssue('long-task', entry.duration, 50);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // PerformanceObserver might not support 'longtask' in all browsers
      console.warn('Long task observation not supported');
    }
  }
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (!isBrowser) return;

  // Track page load
  if (document.readyState === 'complete') {
    trackPageLoad();
  } else {
    window.addEventListener('load', trackPageLoad);
  }

  // Observe long tasks
  observeLongTasks();

  console.log('✅ Performance monitoring initialized');
}
