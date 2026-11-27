// Apex AI Football Simulator Service Worker (v4 - Fast Cache-First Chunks + Real SWR Images)
const STATIC_CACHE = 'apex-static-v4';
const IMAGE_CACHE = 'apex-images-v4';
const ACTIVE_CACHES = new Set([STATIC_CACHE, IMAGE_CACHE]);
const MAX_IMAGE_ENTRIES = 120;

// Strictly lightweight app shell (< 360 KB total)
const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png',
  '/assets/logo.webp',
  '/assets/bg/home.webp',
];

const FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="16" fill="#0f172a"/><circle cx="32" cy="32" r="18" fill="#1e293b" stroke="#ffc940" stroke-opacity="0.5" stroke-width="2"/></svg>';

async function trimImageCache(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length > MAX_IMAGE_ENTRIES) {
      const toDelete = keys.slice(0, keys.length - MAX_IMAGE_ENTRIES);
      await Promise.all(toDelete.map((req) => cache.delete(req)));
    }
  } catch {
    // ignore quota trim errors
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('SW: Pre-caching partial failure, will cache on fetch', err);
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (!ACTIVE_CACHES.has(name)) {
            return caches.delete(name);
          }
          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests; never intercept Supabase / auth / external CDNs
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')) return;

  // 1. HTML Navigation: Network-First with offline shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.put('/index.html', copy)));
          }
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match('/index.html')) ||
            (await caches.match('/')) ||
            new Response('Offline', { status: 503 })
          );
        })
    );
    return;
  }

  // 2. Versioned Vite JS/CSS/Fonts: Cache-First (instant 0ms load, immutable hashes)
  const isImmutableBundle =
    (url.pathname.startsWith('/assets/') &&
      (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) ||
    url.pathname.endsWith('.woff2');

  if (isImmutableBundle) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      })
    );
    return;
  }

  // 3. Images (WebP, PNG, JPG, SVG, AVIF): True Stale-While-Revalidate
  const isImage =
    /\.(webp|png|jpe?g|svg|avif|gif)$/i.test(url.pathname) ||
    request.destination === 'image';

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              await cache.put(request, networkResponse.clone());
              await trimImageCache(cache);
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }

        const networkResponse = await networkPromise;
        if (networkResponse) return networkResponse;

        return new Response(FALLBACK_SVG, {
          status: 200,
          headers: { 'Content-Type': 'image/svg+xml' },
        });
      })
    );
    return;
  }

  // 4. General same-origin fallback (manifest, json, etc.): Cache-First then network
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
