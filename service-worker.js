/**
 * Service Worker — Peachy Pantry
 *
 * Provides offline support for the shopping list so Focus Mode
 * works in-store even with spotty connectivity.
 *
 * Strategy:
 * - Shopping page HTML: Network-first, cached on every load so it's always
 *   available offline after the first visit
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

const CACHE_NAME = 'peachy-pantry-v9';
const API_CACHE = 'peachy-pantry-api-v3';

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
  '/js/faq.js',
  '/js/realtime.js',
  '/js/emoji-maps.js',
  '/js/auth-guard.js',
  '/js/validation.js',
  '/js/demo-tutorial.js',
  '/shopping/shopping.css',
  '/assets/favicon.png',
  '/manifest.json'
];

// Shopping page HTML — cached on every successful load so it's available offline
const SHOPPING_HTML_PATHS = [
  '/shopping/',
  '/shopping/index.html'
];

// API paths that should be cached for offline use
const CACHEABLE_API_PATHS = [
  '/api/shopping-list/'
];

self.addEventListener('install', (event) => {
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

  // Shopping page HTML — network-first, cache on success so it loads offline
  if (SHOPPING_HTML_PATHS.some(p => url.pathname === p || url.pathname === p.replace(/\/$/, ''))) {
    event.respondWith(networkFirstCacheHtml(event.request));
    return;
  }

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

// Network-first for HTML: always try to load fresh, but cache the result.
// Falls back to cache if offline so the page shell still loads.
async function networkFirstCacheHtml(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // No cached copy yet — user has never visited while online
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Peachy Pantry — Offline</title>
      <style>body{font-family:sans-serif;background:#2A241E;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}
      .card{max-width:320px}.emoji{font-size:3rem;margin-bottom:1rem}h1{font-size:1.4rem;margin-bottom:.5rem}
      p{color:rgba(255,255,255,.65);font-size:.9rem;line-height:1.5}
      a{color:#F1C338;text-decoration:none;font-weight:600}</style></head>
      <body><div class="card"><div class="emoji">📡</div>
      <h1>You're offline</h1>
      <p>To use Peachy Pantry offline, visit your <a href="/shopping/">shopping list</a> at least once while connected to WiFi or mobile data. The app will remember your list for next time.</p>
      </div></body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

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
