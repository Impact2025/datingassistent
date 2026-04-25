"use client";
import { logger } from '@/lib/logger';

import { useEffect, useCallback } from 'react';
import { usePWAStore } from '@/stores/pwa-store';
import { reportSWError } from '@/lib/client-error-reporter';

// Current app version - must match public/sw.js
const CURRENT_APP_VERSION = "2.7.2";

// Only register SW in production — dev SW intercepts cause auth/session bugs
const ENABLE_SERVICE_WORKER = process.env.NODE_ENV === 'production';

export function ServiceWorkerRegistration() {
  const {
    setServiceWorkerRegistration,
    setUpdateAvailable,
    setIsOnline,
    setIsInstalled
  } = usePWAStore();

  const checkIfInstalled = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone
      || document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);
    return isStandalone;
  }, [setIsInstalled]);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      logger.log('[SW] Service Workers not supported');
      return;
    }

    if (!ENABLE_SERVICE_WORKER) {
      logger.log('[SW] Service Worker registration disabled');
      return;
    }

    try {
      // Register the static SW from public folder
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });

      logger.log('[SW] Service Worker registered successfully');
      setServiceWorkerRegistration(registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.log('[SW] New version available');
              setUpdateAvailable(true);
            }
          });
        }
      });

      // Check for updates periodically (every 30 minutes)
      setInterval(() => {
        registration.update().catch(console.error);
      }, 30 * 60 * 1000);

    } catch (error: any) {
      console.error('[SW] Registration failed:', error);
      reportSWError(error, { phase: 'registration' });

      // If registration fails, ensure old SWs are cleaned up
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      } catch (cleanupError) {
        console.error('[SW] Cleanup failed:', cleanupError);
      }
    }
  }, [setServiceWorkerRegistration, setUpdateAvailable]);

  const clearCachesOnVersionMismatch = useCallback(async () => {
    const STORED_VERSION_KEY = 'da-app-version';
    const storedVersion = localStorage.getItem(STORED_VERSION_KEY);

    if (storedVersion !== CURRENT_APP_VERSION) {
      logger.log(`[SW] Version update: ${storedVersion || 'none'} -> ${CURRENT_APP_VERSION}`);

      try {
        // Clear old caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const oldCaches = cacheNames.filter(name => !name.includes(CURRENT_APP_VERSION));
          for (const name of oldCaches) {
            await caches.delete(name);
            logger.log('[SW] Cleared old cache:', name);
          }
        }

        localStorage.setItem(STORED_VERSION_KEY, CURRENT_APP_VERSION);

        // Force SW update if registered
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
          }
        }
      } catch (error) {
        console.error('[SW] Cache cleanup error:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Check install status
    checkIfInstalled();

    // Handle online/offline status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clear old caches and register SW (or unregister any lingering dev registrations)
    if (!ENABLE_SERVICE_WORKER) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister());
        });
      }
    } else {
      clearCachesOnVersionMismatch().then(() => {
        registerServiceWorker();
      });
    }

    // Listen for SW messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        logger.log('[SW] Message from SW:', event.data);
      });

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.log('[SW] Controller changed - new SW active');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkIfInstalled, setIsOnline, clearCachesOnVersionMismatch, registerServiceWorker]);

  return null;
}
