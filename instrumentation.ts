export async function register() {
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