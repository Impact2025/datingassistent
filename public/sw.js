// Service Worker UNINSTALLER
// This SW unregisters itself and clears all caches to fix ERR_FAILED issues
// Version 3.0.0 - PWA DISABLED

self.addEventListener('install', (event) => {
  console.log('[SW] Installing uninstaller SW v3.0.0');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating uninstaller SW - clearing all caches and unregistering');

  event.waitUntil(
    (async () => {
      // Clear ALL caches
      const cacheNames = await caches.keys();
      console.log('[SW] Clearing', cacheNames.length, 'caches');
      await Promise.all(cacheNames.map(name => caches.delete(name)));

      // Take control and then unregister
      await self.clients.claim();

      // Notify all clients to reload
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UNINSTALLED', message: 'Service Worker disabled, please reload' });
      });

      // Unregister this service worker
      const registration = await self.registration.unregister();
      console.log('[SW] Service Worker unregistered:', registration);
    })()
  );
});

// Don't handle any fetch events - let browser handle everything directly
