export async function register() {
  // Polyfill browser-only globals for server-side code
  // Fix "self is not defined" error during SSR/SSG
  if (typeof self === 'undefined') {
    (global as any).self = globalThis;
  }
  if (typeof window === 'undefined') {
    (global as any).window = globalThis;
  }

  console.log('✅ Server instrumentation: Global polyfills applied');

  // Temporarily disabled Sentry due to version compatibility issues
  // Will re-enable after fixing integration imports
  /*
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.server.config');
  }
  */
}