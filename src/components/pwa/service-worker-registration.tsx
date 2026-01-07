"use client";

import { useEffect, useCallback } from 'react';
import { usePWAStore } from '@/stores/pwa-store';

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

  useEffect(() => {
    // Check install status
    checkIfInstalled();

    // Listen for display mode changes
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    displayModeQuery.addEventListener('change', handleDisplayModeChange);

    // Only register service worker if supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
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
        console.log('Service Worker controller changed');
      });
    }

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

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      displayModeQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, [setServiceWorkerRegistration, setUpdateAvailable, setIsOnline, checkIfInstalled, setIsInstalled]);

  return null;
}
