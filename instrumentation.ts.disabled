/**
 * NEXT.JS INSTRUMENTATION
 * Initialize monitoring and tracing
 * Called once when the server starts
 */

import { assertValidEnvironment } from './src/lib/env-validation';

export async function register() {
  // SECURITY: Validate environment variables FIRST before anything else
  // This ensures the application fails fast if critical secrets are missing

  // TEMPORARY: Log warnings instead of blocking in production
  // TODO: Remove this after setting up all environment variables in Vercel
  try {
    assertValidEnvironment();
  } catch (error) {
    console.error('\n⚠️  WARNING: Environment validation failed');
    console.error(error instanceof Error ? error.message : 'Unknown error');

    // In development, throw error
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }

    // In production, only log warning (TEMPORARY)
    console.error('\n⚠️  App is running with missing environment variables!');
    console.error('Set required env vars in Vercel to fix this.\n');
  }

  // Initialize Sentry for server-side monitoring
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import server config only in Node.js runtime
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import edge config only in Edge runtime
    await import('./sentry.edge.config');
  }

  console.log('✅ Server instrumentation initialized');
}