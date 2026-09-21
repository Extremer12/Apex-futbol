// Apex AI Football Simulator Service Worker
const CACHE_NAME = 'apex-football-v3';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-512.png',
  '/logo-sinfondo-512.png',
  '/logo-sinfondo-192.png',
  '/bg-inicio.png',
  '/bg-dashboard.png',
  '/bg-pitch.png',
  '/bg-debate.png',
  '/bg-profile.png',
  '/bg-start.png',
  '/sinlogo.png',
  '/sinrostro.png'
];

// Install: Pre-cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('SW: Pre-caching partial failure, will cache on fetch', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests to avoid CORS / cross-origin caching problems
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip API / Supabase external calls from cache
  if (url.origin.includes('supabase.co') || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')) {
    return;
  }

  // 1. SPA Navigation fallback (HTML requests)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        return (await caches.match('/index.html')) || (await caches.match('/')) || new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts) -> Stale-While-Revalidate
  const isStaticAsset = 
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (fetchErr) {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || request.destination === 'image') {
            const fallback = await caches.match('/sinrostro.png');
            if (fallback) return fallback;
          }
          return new Response('Asset not found', { status: 404, statusText: 'Not Found' });
        }
      })
    );
    return;
  }

  // 3. General Fallback
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      try {
        return await fetch(request);
      } catch {
        return new Response('Network error', { status: 408, statusText: 'Request Timeout' });
      }
    })
  );
});
