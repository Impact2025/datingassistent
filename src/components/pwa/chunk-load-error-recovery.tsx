"use client";

import { useEffect } from 'react';

/**
 * CHUNK LOAD ERROR RECOVERY
 *
 * This component detects and recovers from chunk load errors that occur when:
 * 1. A new deployment happens while users have the app open
 * 2. The HTML references old chunks that no longer exist on the server
 * 3. Service Worker tries to fetch non-existent chunks → ERR_FAILED
 *
 * Solution: Automatically reload the page to fetch the new HTML with correct chunk references
 */
export function ChunkLoadErrorRecovery() {
  useEffect(() => {
    // Track if we've already attempted a reload to prevent infinite loops
    const RELOAD_KEY = 'chunk-load-error-reload-attempted';
    const RELOAD_TIMESTAMP_KEY = 'chunk-load-error-reload-timestamp';
    const MAX_RELOAD_ATTEMPTS_PER_HOUR = 3;

    // Check if we should allow a reload
    const canAttemptReload = (): boolean => {
      const lastReloadTime = localStorage.getItem(RELOAD_TIMESTAMP_KEY);
      const reloadCount = localStorage.getItem(RELOAD_KEY);

      if (!lastReloadTime || !reloadCount) {
        return true;
      }

      const hoursSinceLastReload = (Date.now() - parseInt(lastReloadTime)) / (1000 * 60 * 60);

      // Reset counter if it's been more than an hour
      if (hoursSinceLastReload > 1) {
        localStorage.removeItem(RELOAD_KEY);
        localStorage.removeItem(RELOAD_TIMESTAMP_KEY);
        return true;
      }

      // Check if we've exceeded max attempts
      return parseInt(reloadCount) < MAX_RELOAD_ATTEMPTS_PER_HOUR;
    };

    // Record a reload attempt
    const recordReloadAttempt = () => {
      const currentCount = parseInt(localStorage.getItem(RELOAD_KEY) || '0');
      localStorage.setItem(RELOAD_KEY, (currentCount + 1).toString());
      localStorage.setItem(RELOAD_TIMESTAMP_KEY, Date.now().toString());
    };

    // Handle chunk load errors
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error;
      const message = event.message || error?.message || '';

      // Detect chunk load errors
      const isChunkLoadError =
        message.includes('Loading chunk') ||
        message.includes('ChunkLoadError') ||
        message.includes('Failed to fetch dynamically imported module') ||
        (error?.name === 'ChunkLoadError');

      if (isChunkLoadError) {
        console.warn('[Chunk Recovery] Detected chunk load error:', message);

        if (canAttemptReload()) {
          console.log('[Chunk Recovery] Attempting automatic reload to fetch latest chunks...');
          recordReloadAttempt();

          // Clear service worker cache to ensure fresh fetch
          if ('serviceWorker' in navigator && 'caches' in window) {
            caches.keys().then((cacheNames) => {
              const staticCaches = cacheNames.filter(
                name => name.includes('static-assets') || name.includes('pages-cache')
              );
              return Promise.all(staticCaches.map(cache => caches.delete(cache)));
            }).then(() => {
              // Reload the page after cache is cleared
              window.location.reload();
            }).catch((err) => {
              console.error('[Chunk Recovery] Error clearing cache:', err);
              // Reload anyway
              window.location.reload();
            });
          } else {
            // No cache API available, just reload
            window.location.reload();
          }
        } else {
          console.error('[Chunk Recovery] Max reload attempts reached. Please manually refresh the page.');
          // Show user-friendly error message
          if (confirm('Er is een nieuwe versie van de app beschikbaar. Wil je de pagina herladen?')) {
            localStorage.removeItem(RELOAD_KEY);
            localStorage.removeItem(RELOAD_TIMESTAMP_KEY);
            window.location.reload();
          }
        }

        // Prevent error from bubbling up
        event.preventDefault();
        return false;
      }
    };

    // Handle unhandled rejections (for dynamic imports)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || reason?.toString() || '';

      const isChunkLoadError =
        message.includes('Loading chunk') ||
        message.includes('ChunkLoadError') ||
        message.includes('Failed to fetch dynamically imported module');

      if (isChunkLoadError) {
        console.warn('[Chunk Recovery] Detected chunk load error in promise:', message);

        if (canAttemptReload()) {
          console.log('[Chunk Recovery] Attempting automatic reload...');
          recordReloadAttempt();

          // Clear caches and reload
          if ('serviceWorker' in navigator && 'caches' in window) {
            caches.keys().then((cacheNames) => {
              const staticCaches = cacheNames.filter(
                name => name.includes('static-assets') || name.includes('pages-cache')
              );
              return Promise.all(staticCaches.map(cache => caches.delete(cache)));
            }).finally(() => {
              window.location.reload();
            });
          } else {
            window.location.reload();
          }
        }

        event.preventDefault();
      }
    };

    // Register error handlers
    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Clean up old reload tracking data on successful load
    const cleanupOnSuccessfulLoad = () => {
      const lastReloadTime = localStorage.getItem(RELOAD_TIMESTAMP_KEY);
      if (lastReloadTime) {
        const hoursSinceLastReload = (Date.now() - parseInt(lastReloadTime)) / (1000 * 60 * 60);
        // If it's been more than an hour and we loaded successfully, clear the tracking
        if (hoursSinceLastReload > 1) {
          localStorage.removeItem(RELOAD_KEY);
          localStorage.removeItem(RELOAD_TIMESTAMP_KEY);
        }
      }
    };

    cleanupOnSuccessfulLoad();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
