/**
 * SENTRY SERVER CONFIGURATION
 * Server-side error tracking and performance monitoring
 * Edge Runtime compatible
 * Compatible with @sentry/nextjs v10.x
 * Created: 2025-11-22
 * Updated: 2025-12-06 - Fixed for Sentry SDK v10 API with proper type safety
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Only initialize if DSN is configured
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    enabled: IS_PRODUCTION,

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    // Performance Monitoring
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0, // 10% in production, 100% in dev

    // Server-side integrations (Edge-compatible, v10 API)
    integrations: [
      // HTTP integration for tracking API calls (v10: no tracing option)
      ...(IS_PRODUCTION ? [Sentry.httpIntegration()] : []),

      // Postgres integration for database query tracking
      ...(IS_PRODUCTION ? [Sentry.postgresIntegration()] : []),
    ],

    // Debug mode in development
    debug: IS_DEVELOPMENT,

    // Ignore specific errors
    ignoreErrors: [
      // Database connection issues (temporary)
      'ECONNREFUSED',
      'ETIMEDOUT',
      'Connection terminated',

      // Rate limiting (expected behavior)
      'Rate limit exceeded',
      'Too many requests',

      // CSRF protection (expected behavior)
      'CSRF token verification failed',

      // Auth errors (expected)
      'Unauthorized',
      'Invalid token',
      'Token expired',

      // Not found errors (user error, not system error)
      'Not found',
      'Resource not found',
    ],

    // Filter out sensitive data with proper type guards
    beforeSend(event) {
      // Type-safe request sanitization
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
          delete event.request.headers['x-csrf-token'];
        }

        // Remove sensitive cookies (with type guard)
        if (event.request.cookies && typeof event.request.cookies === 'object') {
          const cookies = event.request.cookies as Record<string, string>;
          Object.keys(cookies).forEach((key) => {
            const lowerKey = key.toLowerCase();
            if (
              lowerKey.includes('token') ||
              lowerKey.includes('session') ||
              lowerKey.includes('auth')
            ) {
              cookies[key] = '[REDACTED]';
            }
          });
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
            'cvv',
          ];

          const sanitizeObject = (obj: unknown): unknown => {
            if (typeof obj !== 'object' || obj === null) return obj;

            const sanitized = Array.isArray(obj)
              ? [...obj]
              : { ...(obj as Record<string, unknown>) };

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

        // Sanitize URL query params (with type guard for string)
        if (event.request.query_string) {
          const queryString = event.request.query_string;
          if (typeof queryString === 'string') {
            event.request.query_string = queryString.replace(
              /([?&])(token|key|secret|password)=[^&]*/gi,
              '$1$2=[REDACTED]'
            );
          }
        }
      }

      // Remove environment variables that might contain secrets (with proper type guards)
      if (event.contexts?.runtime) {
        const runtime = event.contexts.runtime as Record<string, unknown>;
        if (runtime.env && typeof runtime.env === 'object') {
          const env = runtime.env as Record<string, string>;
          Object.keys(env).forEach((key) => {
            const lowerKey = key.toLowerCase();
            if (
              lowerKey.includes('secret') ||
              lowerKey.includes('key') ||
              lowerKey.includes('password') ||
              lowerKey.includes('token') ||
              lowerKey.includes('dsn')
            ) {
              env[key] = '[REDACTED]';
            }
          });
        }
      }

      // Add server context
      if (!event.contexts) {
        event.contexts = {};
      }
      event.contexts.server = {
        runtime: process.env.VERCEL ? 'edge' : 'node',
        region: process.env.VERCEL_REGION || 'unknown',
      };

      // Log errors in development
      if (IS_DEVELOPMENT) {
        console.error('[Sentry Server] Capturing error:', event);
      }

      return event;
    },

    // Add custom breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }

      // Sanitize SQL queries
      if (breadcrumb.category === 'query' && breadcrumb.data?.query) {
        const query = breadcrumb.data.query;
        if (typeof query === 'string') {
          breadcrumb.data.query = query
            .replace(/password\s*=\s*'[^']*'/gi, "password='[REDACTED]'")
            .replace(/token\s*=\s*'[^']*'/gi, "token='[REDACTED]'");
        }
      }

      return breadcrumb;
    },

    // Set server context
    initialScope: (scope) => {
      // Add custom tags
      scope.setTag('app', 'datingassistent');
      scope.setTag('platform', 'server');
      scope.setTag('runtime', process.env.VERCEL ? 'edge' : 'node');

      return scope;
    },
  });

  console.log('[Sentry] Server initialized');
} else if (IS_DEVELOPMENT) {
  console.warn('[Sentry] DSN not configured - server error tracking disabled');
}
