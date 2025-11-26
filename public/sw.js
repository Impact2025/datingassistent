// Service Worker for DatingAssistent PWA
const CACHE_NAME = 'dating-assistent-v1.0.0';
const STATIC_CACHE = 'dating-assistent-static-v1.0.0';
const DYNAMIC_CACHE = 'dating-assistent-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/images/Logo Icon DatingAssistent.png',
  '/images/LogoDatingAssistent.png',
  // Core app shell
  '/_next/static/css/main.css',
  '/_next/static/js/main.js',
  // Essential images
  '/images/logo.png',
  '/images/avatar-placeholder.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (except images from trusted domains)
  if (!url.origin.includes(self.location.origin) &&
      !url.hostname.includes('unsplash.com') &&
      !url.hostname.includes('picsum.photos')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default: network-first for dynamic content
  event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache-first strategy failed:', error);
    // Return offline fallback for critical assets
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
  }
}

// Network-first strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache:', error);

    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    // Return generic offline response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Deze functie is niet beschikbaar offline'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Check if request is for a static asset
function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.includes(ext));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event);

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/images/Logo Icon DatingAssistent.png',
      badge: '/images/Logo Icon DatingAssistent.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || [],
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'view') {
    event.waitUntil(
      clients.openWindow(data.url || '/')
    );
  } else {
    // Default action
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync implementation
async function doBackgroundSync() {
  try {
    // Get pending offline actions from IndexedDB
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        await syncAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('❌ Failed to sync action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// IndexedDB helpers (simplified)
async function getPendingActions() {
  // In a real implementation, this would query IndexedDB
  return [];
}

async function syncAction(action) {
  // In a real implementation, this would make API calls
  console.log('🔄 Syncing action:', action);
}

async function removePendingAction(actionId) {
  // In a real implementation, this would remove from IndexedDB
  console.log('🗑️ Removed pending action:', actionId);
}

// Periodic background tasks
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

async function sendDailyReminder() {
  // Send daily motivation notification
  const options = {
    body: 'Tijd om aan je dating doelen te werken! 💪',
    icon: '/images/Logo Icon DatingAssistent.png',
    badge: '/images/Logo Icon DatingAssistent.png',
    tag: 'daily-reminder',
    requireInteraction: false
  };

  await self.registration.showNotification('DatingAssistent Daily', options);
}