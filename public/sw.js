const CACHE_NAME = 'apat-mitra-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/protocols/bleeding.json',
  '/protocols/burns.json',
  '/protocols/cpr.json'
];

// Install event: cache all essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first, fallback to cache for robust offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found (Cache-first approach for performance and airplane mode)
      if (cachedResponse) {
        // Optionally fetch from network in background to update cache
        fetch(event.request).then(response => {
           if (response && response.status === 200) {
             caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
           }
        }).catch(err => console.log('[Service Worker] Offline fallback for background update', err));
        
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone response to cache it and return it
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Do not cache API requests or non-GET methods
          if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
             cache.put(event.request, responseToCache);
          }
        });

        return response;
      }).catch(() => {
        // If network fails (airplane mode) and neither in cache, return index.html for SPA routing
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
