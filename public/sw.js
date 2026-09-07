// Apex AI Football Simulator Service Worker
const CACHE_NAME = 'apex-football-v2';

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

  // Skip API / Supabase external calls from cache
  if (url.origin.includes('supabase.co') || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')) {
    return;
  }

  // 1. SPA Navigation fallback (HTML requests)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
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
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. General Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).catch(() => null);
    })
  );
});
