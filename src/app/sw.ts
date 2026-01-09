// defaultCache removed - was causing stale asset issues
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ============================================
// WORLD-CLASS PWA SERVICE WORKER
// DatingAssistent - Enterprise Grade
// ============================================

const APP_VERSION = "2.5.0"; // DISABLED precaching to fix stale CSS issue permanently
const OFFLINE_CACHE = `dating-offline-v${APP_VERSION}`;

// Initialize Serwist with DISABLED precaching to prevent stale assets
// Precaching was causing CSS/JS to be served from cache after deployments
// even when the files no longer existed on the server
const serwist = new Serwist({
  // CRITICAL FIX: Disable precaching entirely - this was the root cause!
  // Precaching stores assets at install time and serves them forever
  // until SW updates, causing stale CSS/JS after deployments
  precacheEntries: [], // Empty array = no precaching
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  cleanupOutdatedCaches: true,
  runtimeCaching: [
    // CRITICAL: HTML pages - ALWAYS fetch from network
    // Never cache HTML to ensure users always get the latest version
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: "NetworkOnly", // Changed from NetworkFirst - NEVER serve cached HTML
    },
    // CRITICAL: CSS files - ALWAYS fetch from network
    // CSS filenames include hashes, cached versions cause 404s after deploy
    {
      matcher: ({ request }) => request.destination === "style",
      handler: "NetworkOnly", // Changed from NetworkFirst - NEVER serve cached CSS
    },
    // CRITICAL: JavaScript - ALWAYS fetch from network
    // JS chunk filenames include hashes, cached versions cause errors after deploy
    {
      matcher: ({ request }) => request.destination === "script",
      handler: "NetworkOnly", // Changed from NetworkFirst - NEVER serve cached JS
    },
    // API Routes - Network First with fallback (OK to cache for offline)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: "NetworkFirst",
      options: {
        cacheName: `api-cache-v${APP_VERSION}`,
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Images - Stale While Revalidate (safe to cache, no hash issues)
    {
      matcher: ({ request }) => request.destination === "image",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: `image-cache-v${APP_VERSION}`,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Videos - Network Only (too large to cache)
    {
      matcher: ({ request }) => request.destination === "video",
      handler: "NetworkOnly",
    },
    // Fonts - Cache First (safe, rarely change)
    {
      matcher: ({ request }) => request.destination === "font",
      handler: "CacheFirst",
      options: {
        cacheName: `font-cache-v${APP_VERSION}`,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    // External fonts (Google Fonts) - Cache First
    {
      matcher: ({ url }) =>
        url.origin === "https://fonts.googleapis.com" ||
        url.origin === "https://fonts.gstatic.com",
      handler: "CacheFirst",
      options: {
        cacheName: `google-fonts-v${APP_VERSION}`,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options: NotificationOptions = {
      body: data.body || "Je hebt een nieuw bericht",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      image: data.image,
      vibrate: [100, 50, 100, 50, 100],
      tag: data.tag || "dating-notification",
      renotify: true,
      requireInteraction: data.requireInteraction || false,
      data: {
        url: data.url || "/",
        timestamp: Date.now(),
        ...data.data,
      },
      actions: data.actions || [
        { action: "view", title: "Bekijken" },
        { action: "dismiss", title: "Later" },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || "DatingAssistent",
        options
      )
    );
  } catch (error) {
    console.error("Push notification error:", error);
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  if (event.action === "dismiss") {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// ============================================
// BACKGROUND SYNC
// ============================================

self.addEventListener("sync", (event) => {
  console.log("Background sync:", event.tag);

  if (event.tag === "sync-chat-messages") {
    event.waitUntil(syncChatMessages());
  }

  if (event.tag === "sync-profile-updates") {
    event.waitUntil(syncProfileUpdates());
  }

  if (event.tag === "sync-analytics") {
    event.waitUntil(syncAnalytics());
  }
});

async function syncChatMessages() {
  try {
    const db = await openDB();
    const messages = await getFromDB(db, "pending-messages");

    for (const message of messages) {
      try {
        await fetch("/api/coach/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        });
        await deleteFromDB(db, "pending-messages", message.id);
      } catch (error) {
        console.error("Failed to sync message:", message.id);
      }
    }
  } catch (error) {
    console.error("Chat sync failed:", error);
  }
}

async function syncProfileUpdates() {
  try {
    const db = await openDB();
    const updates = await getFromDB(db, "pending-profile-updates");

    for (const update of updates) {
      try {
        await fetch("/api/coaching-profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        });
        await deleteFromDB(db, "pending-profile-updates", update.id);
      } catch (error) {
        console.error("Failed to sync profile update:", update.id);
      }
    }
  } catch (error) {
    console.error("Profile sync failed:", error);
  }
}

async function syncAnalytics() {
  try {
    const db = await openDB();
    const events = await getFromDB(db, "pending-analytics");

    if (events.length > 0) {
      await fetch("/api/analytics/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
      await clearStore(db, "pending-analytics");
    }
  } catch (error) {
    console.error("Analytics sync failed:", error);
  }
}

// ============================================
// PERIODIC BACKGROUND SYNC
// ============================================

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-check-in") {
    event.waitUntil(sendDailyCheckIn());
  }

  if (event.tag === "refresh-content") {
    event.waitUntil(refreshContent());
  }
});

async function sendDailyCheckIn() {
  const hour = new Date().getHours();

  // Only send between 9 AM and 9 PM
  if (hour < 9 || hour > 21) return;

  const messages = [
    "Tijd voor je dagelijkse groei-moment! 🌱",
    "Je dating skills wachten op je! 💪",
    "Nieuwe inzichten beschikbaar in je dashboard 📊",
    "Iris heeft tips voor je klaarstaan! 💝",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  await self.registration.showNotification("DatingAssistent", {
    body: randomMessage,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "daily-check-in",
    data: { url: "/dashboard" },
  });
}

async function refreshContent() {
  try {
    // Pre-cache important pages
    const cache = await caches.open(`pages-cache-v${APP_VERSION}`);
    await cache.addAll(["/dashboard", "/profiel", "/chat"]);
  } catch (error) {
    console.error("Content refresh failed:", error);
  }
}

// ============================================
// INDEXEDDB HELPERS
// ============================================

const DB_NAME = "dating-assistant-offline";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("pending-messages")) {
        db.createObjectStore("pending-messages", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pending-profile-updates")) {
        db.createObjectStore("pending-profile-updates", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pending-analytics")) {
        db.createObjectStore("pending-analytics", { keyPath: "id" });
      }
    };
  });
}

function getFromDB(db: IDBDatabase, storeName: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromDB(db: IDBDatabase, storeName: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function clearStore(db: IDBDatabase, storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================
// SHARE TARGET HANDLER
// ============================================

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle share target
  if (url.pathname === "/share-target" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
    return;
  }
});

async function handleShareTarget(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const text = formData.get("text") as string;
    const url = formData.get("url") as string;

    // Redirect to chat with shared content
    const redirectUrl = new URL("/chat", self.location.origin);
    if (title) redirectUrl.searchParams.set("title", title);
    if (text) redirectUrl.searchParams.set("text", text);
    if (url) redirectUrl.searchParams.set("url", url);

    return Response.redirect(redirectUrl.toString(), 303);
  } catch (error) {
    console.error("Share target error:", error);
    return Response.redirect("/", 303);
  }
}

// ============================================
// CACHE CLEANUP ON INSTALL (before activation)
// ============================================

self.addEventListener("install", (event) => {
  console.log(`[SW] Installing Service Worker v${APP_VERSION}`);

  event.waitUntil(
    (async () => {
      // Delete ALL existing caches during install
      // This ensures stale assets are removed before the new SW activates
      const cacheNames = await caches.keys();
      if (cacheNames.length > 0) {
        console.log(`[SW] Clearing ${cacheNames.length} old caches during install:`, cacheNames);
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Skip waiting to activate immediately
      await self.skipWaiting();
      console.log(`[SW] Service Worker v${APP_VERSION} installed and skipped waiting`);
    })()
  );
});

// ============================================
// CACHE CLEANUP ON ACTIVATION
// ============================================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // NUCLEAR OPTION: Delete ALL caches on activation
      // Since we disabled precaching and use NetworkOnly for critical assets,
      // there's no reason to keep any old caches
      const cacheNames = await caches.keys();

      console.log(`[SW] NUCLEAR CLEANUP: Deleting ALL ${cacheNames.length} caches:`, cacheNames);

      await Promise.all(
        cacheNames.map((name) => {
          console.log(`[SW] Deleting cache: ${name}`);
          return caches.delete(name);
        })
      );

      // Take control of all clients immediately
      await self.clients.claim();

      // Force all clients to reload to get fresh assets
      const clients = await self.clients.matchAll({ type: "window" });
      console.log(`[SW] Service Worker v${APP_VERSION} activated. Notifying ${clients.length} clients to reload.`);

      // Send message to all clients to reload
      clients.forEach((client) => {
        client.postMessage({
          type: "SW_ACTIVATED",
          version: APP_VERSION,
          message: "New service worker activated, please reload for latest version"
        });
      });

      console.log(`[SW] Service Worker v${APP_VERSION} activated and controlling all clients`);
    })()
  );
});

// Initialize Serwist
serwist.addEventListeners();
