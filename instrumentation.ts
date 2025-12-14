/**
 * NEXT.JS INSTRUMENTATION
 * Initialize monitoring and tracing
 * Called once when the server starts
 */

import { assertValidEnvironment } from './src/lib/env-validation';

export async function register() {
  // SECURITY: Validate environment variables FIRST before anything else
  // This ensures the application fails fast if critical secrets are missing
  try {
    assertValidEnvironment();
  } catch (error) {
    console.error('\n🚨 FATAL: Environment validation failed');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    console.error('\nApplication startup blocked. Fix environment variables and restart.\n');

    // In production, exit the process to prevent running with missing secrets
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }

    throw error;
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