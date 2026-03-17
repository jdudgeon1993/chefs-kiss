/**
 * Service Worker — Chef's Kiss - Python Age 5.0
 *
 * Provides offline support for the shopping list so Focus Mode
 * works in-store even with spotty connectivity.
 *
 * Strategy:
 * - Shopping list API: Network-first, falling back to cache
 * - Static assets (CSS/JS): Cache-first for speed
 * - All other API calls: Network-only (no stale data for mutations)
 */

const CACHE_NAME = 'chefs-kiss-v2';
const API_CACHE = 'chefs-kiss-api-v1';

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  '/css/shared.css',
  '/css/shopping-focus-mode.css',
  '/js/app.js',
  '/js/api.js',
  '/js/utils.js',
  '/js/config.js',
  '/js/settings.js',
  '/js/shopping-focus-mode.js',
  '/shopping/',
  '/shopping/index.html',
  '/shopping/shopping.css'
];

// API paths that should be cached for offline use
const CACHEABLE_API_PATHS = [
  '/api/shopping-list/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('SW: Pre-cache failed (non-fatal):', err);
        return self.skipWaiting();
      })
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

  // Everything else — just fetch normally
});

/**
 * Network-first: try network, cache the response, fall back to cache if offline.
 */
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    // Clone and cache successful responses
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Network failed — try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Nothing cached — return an offline-friendly error
    return new Response(
      JSON.stringify({
        shopping_list: [],
        offline: true,
        error: 'You are offline. Cached data not available.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache-first: serve from cache, fall back to network.
 */
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
