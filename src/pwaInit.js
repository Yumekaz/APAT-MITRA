import { syncProtocolsToStore } from './protocolStore'

const BASE = import.meta.env.BASE_URL

export function registerPWA() {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${BASE}sw.js`)
      .then(() => {
        if ('indexedDB' in window) {
          syncProtocolsToStore(BASE).catch(error => {
            console.warn('Protocol sync skipped', error)
          })
        }
      })
      .catch(error => {
        console.log('[Service Worker] Registration failed:', error)
      })
  })
}
