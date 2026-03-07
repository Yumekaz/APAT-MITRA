const CACHE_NAME = 'apat-mitra-v3'
const BASE = self.registration.scope

const ASSETS_TO_CACHE = [
  '',
  'index.html',
  'manifest.json',
  'icon.svg',
  'protocols/bleeding.json',
  'protocols/burns.json',
  'protocols/cpr.json',
  'protocols/fracture.json',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ASSETS_TO_CACHE.map(path => new URL(path, BASE).href))
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        event.waitUntil(
          fetch(event.request)
            .then(response => {
              if (response.ok && event.request.url.startsWith(self.location.origin)) {
                return caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()))
              }
              return null
            })
            .catch(() => null)
        )
        return cachedResponse
      }

      return fetch(event.request)
        .then(response => {
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            const copy = response.clone()
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)))
          }
          return response
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(new URL('index.html', BASE).href)
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' })
        })
    })
  )
})
