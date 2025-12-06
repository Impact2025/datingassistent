/**
 * SENTRY CLIENT CONFIGURATION
 * Browser-side error tracking and performance monitoring
 * Compatible with @sentry/nextjs v10.x
 * Created: 2025-11-22
 * Updated: 2025-12-06 - Fixed for Sentry SDK v10 API
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Only initialize if DSN is configured
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
    enabled: IS_PRODUCTION,

    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Performance Monitoring
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0, // 10% in production, 100% in dev

    // Session Replay
    replaysSessionSampleRate: IS_PRODUCTION ? 0.05 : 0.5, // 5% in production, 50% in dev
    replaysOnErrorSampleRate: 1.0, // 100% when errors occur

    // Trace propagation targets (moved to top-level in v10)
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/datingassistent\.vercel\.app/,
      /^https:\/\/.*\.vercel\.app/,
    ],

    // Integrations
    integrations: [
      // Session Replay - helps debug user sessions
      Sentry.replayIntegration({
        maskAllText: true, // Privacy: mask all text
        blockAllMedia: true, // Privacy: block all media
        maskAllInputs: true, // Privacy: mask all inputs
      }),

      // Browser Performance Tracing (v10 API - no options needed)
      Sentry.browserTracingIntegration(),

      // User Feedback Widget
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        showBranding: false,
        formTitle: 'Iets mis gegaan?',
        submitButtonLabel: 'Verstuur Feedback',
        cancelButtonLabel: 'Annuleer',
        confirmButtonLabel: 'Bevestig',
        addScreenshotButtonLabel: 'Screenshot toevoegen',
        removeScreenshotButtonLabel: 'Screenshot verwijderen',
        nameLabel: 'Naam',
        namePlaceholder: 'Je naam',
        emailLabel: 'Email',
        emailPlaceholder: 'je@email.com',
        messageLabel: 'Beschrijving',
        messagePlaceholder: 'Wat ging er mis?',
        successMessageText: 'Bedankt voor je feedback!',
      }),

      // Browser Profiling (production only)
      ...(IS_PRODUCTION ? [Sentry.browserProfilingIntegration()] : []),
    ],

    // Debug mode in development
    debug: IS_DEVELOPMENT,

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Network errors
      'Network request failed',
      'NetworkError',
      'Failed to fetch',

      // React hydration (non-critical)
      'Hydration failed',
      'Text content does not match',

      // Known third-party issues
      'ResizeObserver loop',
      'Non-Error promise rejection',
    ],

    // Ignore specific URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,

      // Third-party scripts
      /google-analytics\.com/i,
      /googletagmanager\.com/i,
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from error reports
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }

        // Remove sensitive data from request body
        if (event.request.data) {
          const sensitiveFields = [
            'password',
            'token',
            'jwt',
            'secret',
            'key',
            'apiKey',
            'access_token',
            'refresh_token',
            'creditCard',
            'ssn',
          ];

          const sanitizeObject = (obj: unknown): unknown => {
            if (typeof obj !== 'object' || obj === null) return obj;

            const sanitized = Array.isArray(obj) ? [...obj] : { ...(obj as Record<string, unknown>) };

            for (const key in sanitized) {
              const lowerKey = key.toLowerCase();
              if (sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
                (sanitized as Record<string, unknown>)[key] = '[REDACTED]';
              } else if (typeof (sanitized as Record<string, unknown>)[key] === 'object') {
                (sanitized as Record<string, unknown>)[key] = sanitizeObject(
                  (sanitized as Record<string, unknown>)[key]
                );
              }
            }

            return sanitized;
          };

          event.request.data = sanitizeObject(event.request.data) as string;
        }
      }

      // Log errors in development
      if (IS_DEVELOPMENT) {
        console.error('[Sentry] Capturing error:', event, hint);
      }

      return event;
    },

    // Add custom breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }

      // Sanitize breadcrumb data
      if (breadcrumb.data) {
        const sanitizeValue = (value: unknown): unknown => {
          if (typeof value === 'string') {
            // Redact email addresses
            return value.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');
          }
          return value;
        };

        breadcrumb.data = Object.fromEntries(
          Object.entries(breadcrumb.data).map(([key, value]) => [key, sanitizeValue(value)])
        );
      }

      return breadcrumb;
    },

    // Set user context
    initialScope: (scope) => {
      // Add custom tags
      scope.setTag('app', 'datingassistent');
      scope.setTag('platform', 'web');

      return scope;
    },
  });

  console.log('[Sentry] Client initialized');
} else if (IS_DEVELOPMENT) {
  console.warn('[Sentry] DSN not configured - error tracking disabled');
}
