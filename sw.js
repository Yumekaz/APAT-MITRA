const CACHE_NAME = 'apat-mitra-v4'
const BASE = self.registration.scope
const ORIGIN = self.location.origin

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

async function cacheRequest(cache, url) {
  try {
    const response = await fetch(url, { cache: 'no-cache' })
    if (response.ok) {
      await cache.put(url, response)
    }
  } catch {
    return null
  }
  return null
}

async function discoverShellAssets() {
  const indexUrl = new URL('index.html', BASE).href

  try {
    const response = await fetch(indexUrl, { cache: 'no-cache' })
    if (!response.ok) return []

    const html = await response.text()
    const assets = Array.from(html.matchAll(/(?:href|src)=["']([^"']+)["']/g), match => match[1])
      .map(path => new URL(path, BASE).href)
      .filter(url => url.startsWith(ORIGIN))

    return [...new Set([new URL('', BASE).href, indexUrl, ...assets])]
  } catch {
    return [new URL('', BASE).href, indexUrl]
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const coreUrls = ASSETS_TO_CACHE.map(path => new URL(path, BASE).href)
      const shellUrls = await discoverShellAssets()

      for (const url of [...new Set([...coreUrls, ...shellUrls])]) {
        await cacheRequest(cache, url)
      }
    })()
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
