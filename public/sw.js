const CACHE_NAME = 'aja-logistics-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/public/manifest.webmanifest',
  '/icon.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event with Network-First for API calls and Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET or chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // API Requests: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful GET responses
          if (response.ok) {
            const resClone = response.clone();
            caches.open('aja-api-cache').then((cache) => cache.put(request, resClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ error: 'أنت الآن متصل بدون إنترنت (Offline Mode). يرجى التأكد من اتصالك بشبكة الإنترنت' }),
              { headers: { 'Content-[#Type]': 'application/json' }, status: 503 }
            );
          });
        })
    );
    return;
  }

  // Static Assets / App Shell: Cache First with Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update for cache freshness
        fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok && request.url.startsWith(self.location.origin)) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
        }
        return networkResponse;
      }).catch(() => {
        // Offline Fallback for html pages
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
