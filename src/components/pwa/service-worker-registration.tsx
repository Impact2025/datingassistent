"use client";

import { useEffect, useCallback } from 'react';
import { usePWAStore } from '@/stores/pwa-store';

// Current app version - must match sw.ts
const CURRENT_APP_VERSION = "2.7.0";

export function ServiceWorkerRegistration() {
  const {
    setServiceWorkerRegistration,
    setUpdateAvailable,
    setIsOnline,
    setIsInstalled
  } = usePWAStore();

  const checkIfInstalled = useCallback(() => {
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone
      || document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);
    return isStandalone;
  }, [setIsInstalled]);

  // Force clear all caches on version mismatch
  const clearAllCachesOnVersionMismatch = useCallback(async () => {
    const STORED_VERSION_KEY = 'da-app-version';
    const storedVersion = localStorage.getItem(STORED_VERSION_KEY);

    if (storedVersion !== CURRENT_APP_VERSION) {
      console.log(`[SW] Version mismatch: ${storedVersion} -> ${CURRENT_APP_VERSION}. Clearing all caches...`);

      try {
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          console.log(`[SW] Found ${cacheNames.length} caches to clear:`, cacheNames);
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('[SW] All caches cleared');
        }

        // Unregister old service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('[SW] Unregistered old service worker');
          }
        }

        // Update stored version
        localStorage.setItem(STORED_VERSION_KEY, CURRENT_APP_VERSION);

        // Only reload if we actually had a stored version (not first visit)
        if (storedVersion) {
          console.log('[SW] Reloading page to apply fresh assets...');
          window.location.reload();
          return true;
        }
      } catch (error) {
        console.error('[SW] Error clearing caches:', error);
      }

      localStorage.setItem(STORED_VERSION_KEY, CURRENT_APP_VERSION);
    }
    return false;
  }, []);

  useEffect(() => {
    // Check install status
    checkIfInstalled();

    // TEMPORARILY DISABLED: Service Worker causing ERR_FAILED on some networks
    // Unregister any existing SW to fix the issue
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
          console.log('[SW] Unregistered service worker to fix ERR_FAILED');
        });
      });
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    }

    // Handle online/offline status (still useful without SW)
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkIfInstalled, setIsOnline]);

  return null;
}
