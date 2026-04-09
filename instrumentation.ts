/* eslint-disable no-console */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Suppress verbose console output in production (server-side only)
  // console.error and console.warn remain active for real issues
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_RUNTIME === 'nodejs') {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: false,
      environment: process.env.NODE_ENV,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: false,
      environment: process.env.NODE_ENV,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
