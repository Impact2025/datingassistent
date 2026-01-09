"use client";

import { useEffect, useCallback } from 'react';
import { usePWAStore } from '@/stores/pwa-store';

// Current app version - must match sw.ts
const CURRENT_APP_VERSION = "2.5.0";

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

    // Clear caches on version mismatch first
    clearAllCachesOnVersionMismatch().then((didReload) => {
      if (didReload) return; // Page will reload, don't continue

      // Continue with normal initialization
      initializeServiceWorker();
    });

    // Listen for display mode changes
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    displayModeQuery.addEventListener('change', handleDisplayModeChange);

    // Handle online/offline status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Trigger background sync when back online
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-pending-data');
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    function initializeServiceWorker() {
      // Only register service worker if supported
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        // Listen for messages from service worker (including reload requests)
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SW_ACTIVATED') {
            console.log('[SW] Received activation message from SW:', event.data);
            // New SW activated, reload to get fresh assets
            const isReloading = sessionStorage.getItem('sw-activation-reload');
            if (!isReloading) {
              console.log('[SW] New SW activated, reloading for fresh assets...');
              sessionStorage.setItem('sw-activation-reload', 'true');
              // Clear ALL caches before reload
              if ('caches' in window) {
                caches.keys().then((names) => Promise.all(names.map(n => caches.delete(n))))
                  .finally(() => window.location.reload());
              } else {
                window.location.reload();
              }
            }
          }
        });

        // Clear reload flag on successful load
        window.addEventListener('load', () => {
          sessionStorage.removeItem('sw-activation-reload');
          sessionStorage.removeItem('sw-controller-change-reload');
        }, { once: true });

        // Register service worker
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
            setServiceWorkerRegistration(registration);

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    console.log('New app version available!');
                    setUpdateAvailable(true);
                  }
                });
              }
            });

            // Check for updates periodically (every 60 minutes)
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });

        // Handle controller change (when new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] Service Worker controller changed - new version is active');

          // When controller changes, it means a new SW has taken over
          // This is the perfect time to reload to get fresh chunks
          // But only if we're not already in the middle of a reload
          const isReloading = sessionStorage.getItem('sw-controller-change-reload');

          if (!isReloading) {
            console.log('[SW] Reloading page to fetch latest chunks from new deployment');
            sessionStorage.setItem('sw-controller-change-reload', 'true');

            // Clear ALL caches to ensure fresh fetch (aggressive cleanup)
            if ('caches' in window) {
              caches.keys().then((cacheNames) => {
                console.log('[SW] Clearing all caches:', cacheNames);
                return Promise.all(cacheNames.map(cache => caches.delete(cache)));
              }).finally(() => {
                window.location.reload();
              });
            } else {
              window.location.reload();
            }
          }
        });
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      displayModeQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, [setServiceWorkerRegistration, setUpdateAvailable, setIsOnline, checkIfInstalled, setIsInstalled, clearAllCachesOnVersionMismatch]);

  return null;
}
