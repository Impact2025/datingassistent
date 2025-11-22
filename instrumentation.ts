/**
 * NEXT.JS INSTRUMENTATION
 * Initialize monitoring and tracing
 * Called once when the server starts
 */

export async function register() {
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