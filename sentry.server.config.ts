/**
 * SENTRY SERVER CONFIGURATION
 * Server-side error tracking and performance monitoring
 * Edge Runtime compatible
 * Created: 2025-11-22
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

    // Server-side integrations (Edge-compatible)
    integrations: [
      // HTTP integration for tracking API calls
      ...(IS_PRODUCTION ? [
        Sentry.httpIntegration({
          tracing: true,
        }),
      ] : []),

      // Postgres integration for database query tracking
      ...(IS_PRODUCTION ? [
        Sentry.postgresIntegration(),
      ] : []),
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

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from server-side errors
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
          delete event.request.headers['x-csrf-token'];
        }

        // Remove sensitive cookies
        if (event.request.cookies) {
          const cookieKeys = Object.keys(event.request.cookies);
          cookieKeys.forEach(key => {
            if (key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('session') ||
                key.toLowerCase().includes('auth')) {
              event.request.cookies![key] = '[REDACTED]';
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

          const sanitizeObject = (obj: any): any => {
            if (typeof obj !== 'object' || obj === null) return obj;

            const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

            for (const key in sanitized) {
              const lowerKey = key.toLowerCase();
              if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
                sanitized[key] = '[REDACTED]';
              } else if (typeof sanitized[key] === 'object') {
                sanitized[key] = sanitizeObject(sanitized[key]);
              }
            }

            return sanitized;
          };

          event.request.data = sanitizeObject(event.request.data);
        }

        // Sanitize URL query params
        if (event.request.query_string) {
          // Remove tokens from query strings
          event.request.query_string = event.request.query_string
            .replace(/([?&])(token|key|secret|password)=[^&]*/gi, '$1$2=[REDACTED]');
        }
      }

      // Remove environment variables that might contain secrets
      if (event.contexts?.runtime?.env) {
        const envKeys = Object.keys(event.contexts.runtime.env);
        envKeys.forEach(key => {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('secret') ||
              lowerKey.includes('key') ||
              lowerKey.includes('password') ||
              lowerKey.includes('token') ||
              lowerKey.includes('dsn')) {
            event.contexts.runtime.env[key] = '[REDACTED]';
          }
        });
      }

      // Add server context
      if (event.contexts) {
        event.contexts.server = {
          runtime: process.env.VERCEL ? 'edge' : 'node',
          region: process.env.VERCEL_REGION || 'unknown',
        };
      }

      // Log errors in development
      if (IS_DEVELOPMENT) {
        console.error('[Sentry Server] Capturing error:', event, hint);
      }

      return event;
    },

    // Add custom breadcrumbs
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }

      // Sanitize SQL queries
      if (breadcrumb.category === 'query' && breadcrumb.data?.query) {
        // Remove sensitive data from SQL queries
        breadcrumb.data.query = breadcrumb.data.query
          .replace(/password\s*=\s*'[^']*'/gi, "password='[REDACTED]'")
          .replace(/token\s*=\s*'[^']*'/gi, "token='[REDACTED]'");
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

  console.log('✅ Sentry server initialized');
} else {
  console.warn('⚠️ Sentry DSN not configured - server error tracking disabled');
}
