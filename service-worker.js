/**
 * Service Worker — Peachy Pantry
 *
 * Provides offline support for the shopping list so Focus Mode
 * works in-store even with spotty connectivity.
 *
 * Strategy:
 * - Shopping list API: Network-first, falling back to cache
 * - Static assets (CSS/JS): Cache-first for speed
 * - All other API calls: Network-only (no stale data for mutations)
 *
 * Update flow:
 * - New SW installs but does NOT auto-activate (no self.skipWaiting())
 * - App detects the waiting SW and shows an "Update ready" banner
 * - User clicks Refresh (or navigates), app sends SKIP_WAITING message
 * - SW skips waiting, activates, controllerchange fires, app reloads cleanly
 */

const CACHE_NAME = 'peachy-pantry-v7';
const API_CACHE = 'peachy-pantry-api-v3';

// Static assets to pre-cache on install.
// HTML files are intentionally excluded — always fetched fresh so
// updated JS/CSS version strings take effect immediately.
const STATIC_ASSETS = [
  '/css/shared.css',
  '/css/shopping-focus-mode.css',
  '/js/app.js',
  '/js/api.js',
  '/js/utils.js',
  '/js/config.js',
  '/js/settings.js',
  '/js/shopping-focus-mode.js',
  '/shopping/shopping.css'
];

// API paths that should be cached for offline use
const CACHEABLE_API_PATHS = [
  '/api/shopping-list/'
];

self.addEventListener('install', (event) => {
  // Pre-cache static assets. Do NOT call skipWaiting() here —
  // the app controls when to activate via the SKIP_WAITING message.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(err => console.warn('SW: Pre-cache failed (non-fatal):', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== API_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// App sends SKIP_WAITING when it's safe to activate the new SW
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Shopping list API — network-first with cache fallback
  if (CACHEABLE_API_PATHS.some(path => url.pathname.endsWith(path))) {
    event.respondWith(networkFirstWithCache(event.request));
    return;
  }

  // Static assets — cache-first
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(cacheFirstWithNetwork(event.request));
    return;
  }

  // Everything else — fetch normally
});

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({
        shopping_list: [],
        offline: true,
        error: 'You are offline. Cached data not available.'
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Offline', { status: 503 });
  }
}
