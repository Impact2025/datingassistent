"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('🔄 New app version available!');

                  // Show update prompt (you could integrate with a toast system)
                  if (window.confirm('Nieuwe versie beschikbaar! Wil je nu updaten?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(() => {
              Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                  console.log('🔔 Notification permission granted');
                }
              });
            }, 5000); // Wait 5 seconds after registration
          }
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // Handle controller change (when new SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed');
        // Optionally reload the page
        // window.location.reload();
      });
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log('🌐 Back online');
      // You could show a toast or update UI state here
    };

    const handleOffline = () => {
      console.log('📱 Gone offline');
      // You could show a toast or update UI state here
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null; // This component doesn't render anything
}