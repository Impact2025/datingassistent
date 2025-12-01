/**
 * Performance monitoring and error tracking system
 * Provides comprehensive monitoring for production applications
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  timestamp: number;
  userId?: number;
  url: string;
  userAgent: string;
  tags?: Record<string, string>;
}

interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB';
  value: number;
  timestamp: number;
  id?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorEvent[] = [];
  private webVitals: WebVitalsMetric[] = [];
  private maxMetrics = 1000;
  private maxErrors = 500;

  constructor() {
    this.initializeWebVitalsTracking();
    this.initializeErrorTracking();
    this.initializePerformanceObserver();
  }

  /**
   * Track custom performance metric
   */
  trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };

    this.metrics.push(metric);

    // Maintain max size
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService('metric', metric);
    }
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, duration: number, status: number, method: string = 'GET'): void {
    this.trackMetric(`api.${method.toLowerCase()}.${endpoint}`, duration, {
      status: status.toString(),
      endpoint,
      method
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, element: string, duration?: number): void {
    this.trackMetric(`interaction.${action}`, duration || 0, {
      element,
      action
    });
  }

  /**
   * Track page load performance
   */
  trackPageLoad(page: string, loadTime: number): void {
    this.trackMetric('page.load', loadTime, { page });
  }

  /**
   * Track error event
   */
  trackError(error: Error, context?: Record<string, any>): void {
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      tags: context
    };

    this.errors.push(errorEvent);

    // Maintain max size
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Send to error tracking service
    this.sendToErrorService(errorEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Tracked Error:', errorEvent);
    }
  }

  /**
   * Track Web Vitals
   */
  trackWebVital(metric: WebVitalsMetric): void {
    this.webVitals.push(metric);

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService('webvital', metric);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital ${metric.name}:`, metric.value);
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour);
    const recentErrors = this.errors.filter(e => e.timestamp > lastHour);

    return {
      metricsCount: this.metrics.length,
      errorsCount: this.errors.length,
      recentMetricsCount: recentMetrics.length,
      recentErrorsCount: recentErrors.length,
      webVitalsCount: this.webVitals.length,
      averageResponseTime: this.calculateAverageResponseTime(recentMetrics),
      errorRate: this.calculateErrorRate(recentMetrics, recentErrors),
      topErrors: this.getTopErrors(recentErrors, 5)
    };
  }

  /**
   * Export data for external analysis
   */
  exportData() {
    return {
      metrics: this.metrics,
      errors: this.errors,
      webVitals: this.webVitals,
      stats: this.getStats(),
      exportTime: new Date().toISOString()
    };
  }

  private initializeWebVitalsTracking(): void {
    if (typeof window === 'undefined') return;

    // Import web-vitals library dynamically
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => this.trackWebVital({
        name: 'CLS',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id
      }));

      getFID((metric) => this.trackWebVital({
        name: 'FID',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id
      }));

      getFCP((metric) => this.trackWebVital({
        name: 'FCP',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id
      }));

      getLCP((metric) => this.trackWebVital({
        name: 'LCP',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id
      }));

      getTTFB((metric) => this.trackWebVital({
        name: 'TTFB',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id
      }));
    }).catch((error) => {
      console.warn('Web Vitals tracking failed to load:', error);
    });
  }

  private initializeErrorTracking(): void {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'promise_rejection'
      });
    });
  }

  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // Observe navigation timing
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackPageLoad(window.location.pathname, navEntry.loadEventEnd - navEntry.fetchStart);
          }
        }
      }).observe({ entryTypes: ['navigation'] });

      // Observe resource loading
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.duration > 1000) { // Only track slow resources
              this.trackMetric('resource.load.slow', resourceEntry.duration, {
                url: resourceEntry.name,
                type: entry.initiatorType || 'unknown'
              });
            }
          }
        }
      }).observe({ entryTypes: ['resource'] });

    } catch (error) {
      console.warn('Performance Observer initialization failed:', error);
    }
  }

  private calculateAverageResponseTime(metrics: PerformanceMetric[]): number {
    const apiMetrics = metrics.filter(m => m.name.startsWith('api.'));
    if (apiMetrics.length === 0) return 0;

    const total = apiMetrics.reduce((sum, m) => sum + m.value, 0);
    return total / apiMetrics.length;
  }

  private calculateErrorRate(metrics: PerformanceMetric[], errors: ErrorEvent[]): number {
    const totalRequests = metrics.filter(m => m.name.startsWith('api.')).length;
    if (totalRequests === 0) return 0;

    return (errors.length / totalRequests) * 100;
  }

  private getTopErrors(errors: ErrorEvent[], limit: number): Array<{ message: string; count: number }> {
    const errorCounts = errors.reduce((acc, error) => {
      const key = error.message;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([message, count]) => ({ message, count }));
  }

  private sendToMonitoringService(type: string, data: any): void {
    // In a real implementation, send to services like:
    // - DataDog
    // - New Relic
    // - CloudWatch
    // - Custom monitoring endpoint

    const payload = {
      type,
      data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Example: fetch('/api/monitoring', { method: 'POST', body: JSON.stringify(payload) })
    console.log('Sending to monitoring service:', payload);
  }

  private sendToErrorService(error: ErrorEvent): void {
    // Send to error tracking services like:
    // - Sentry
    // - Rollbar
    // - Bugsnag
    // - LogRocket

    console.error('Sending error to tracking service:', error);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for easy tracking
export const trackApiCall = (endpoint: string, duration: number, status: number, method?: string) => {
  performanceMonitor.trackApiCall(endpoint, duration, status, method);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  performanceMonitor.trackError(error, context);
};

export const trackMetric = (name: string, value: number, tags?: Record<string, string>) => {
  performanceMonitor.trackMetric(name, value, tags);
};

export default PerformanceMonitor;