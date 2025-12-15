/**
 * PERFORMANCE MONITORING HOOK
 * Track Core Web Vitals and report to analytics
 */

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function usePerformanceMonitoring() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}:`, metric.value);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Vercel Analytics (automatic)
      // Or custom endpoint:
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(() => {});  // Silent fail
    }

    // Send to Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(`Web Vital: ${metric.name}`, {
        level: 'info',
        tags: {
          webVital: metric.name,
        },
        extra: {
          value: metric.value,
          rating: metric.rating,
        },
      });
    }
  });
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },  // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },     // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },    // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 },   // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 },   // Time to First Byte
};

export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}
