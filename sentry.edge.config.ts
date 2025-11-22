/**
 * SENTRY EDGE RUNTIME CONFIGURATION
 * Minimal Sentry config for Edge Runtime (middleware, edge functions)
 * Created: 2025-11-22
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Edge Runtime has limitations - minimal config only
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    enabled: IS_PRODUCTION,

    // Lower sample rate for edge due to execution limits
    tracesSampleRate: IS_PRODUCTION ? 0.05 : 0.5,

    // No heavy integrations in Edge Runtime
    integrations: [],

    // Minimal debug logging
    debug: false,

    // Filter out sensitive data
    beforeSend(event) {
      // Remove all headers and cookies for edge security
      if (event.request) {
        delete event.request.headers;
        delete event.request.cookies;
        delete event.request.data;
      }

      // Add edge runtime tag
      if (event.contexts) {
        event.contexts.runtime = {
          name: 'edge',
        };
      }

      return event;
    },

    // Set edge context
    initialScope: (scope) => {
      scope.setTag('runtime', 'edge');
      return scope;
    },
  });

  console.log('✅ Sentry edge initialized');
}
