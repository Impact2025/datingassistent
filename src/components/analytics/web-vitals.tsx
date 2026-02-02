'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect, useState } from 'react';
import { hasAnalyticsConsent } from '@/components/cookie-consent';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function WebVitals() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      setHasConsent(hasAnalyticsConsent());
    };

    checkConsent();

    window.addEventListener('consentUpdated', checkConsent);
    return () => window.removeEventListener('consentUpdated', checkConsent);
  }, []);

  useReportWebVitals((metric) => {
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', metric);
    }

    // Only send with consent
    if (!hasConsent) {
      return;
    }

    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        custom_map: {
          metric_id: 'dimension1',
          metric_value: 'metric1',
          metric_delta: 'metric2'
        }
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      sendToAnalyticsEndpoint(metric).catch(console.error);
    }
  });

  return null;
}

// Send metrics to custom analytics endpoint
async function sendToAnalyticsEndpoint(metric: any) {
  try {
    const response = await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to send web vitals to analytics endpoint');
    }
  } catch (error) {
    // Silently fail to avoid console spam
    console.warn('Error sending web vitals:', error);
  }
}

// Performance observer for additional metrics
export function usePerformanceObserver() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only track with consent
    if (!hasAnalyticsConsent()) {
      return;
    }

    // Observe navigation timing
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          sendPerformanceMetric({
            name: 'navigation_timing',
            value: navEntry.loadEventEnd - navEntry.fetchStart,
            type: 'navigation',
            timestamp: Date.now(),
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      // Performance observer not supported
    }

    return () => observer.disconnect();
  }, []);
}

async function sendPerformanceMetric(metric: any) {
  if (process.env.NODE_ENV !== 'production') return;

  try {
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    });
  } catch (error) {
    // Silently fail
  }
}