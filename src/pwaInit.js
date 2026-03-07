const DB_NAME = 'apatMitraDB'
const STORE_NAME = 'protocols'
const PROTOCOL_IDS = ['bleeding', 'burns', 'cpr', 'fracture']
const BASE = import.meta.env.BASE_URL

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = event => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = event => resolve(event.target.result)
    request.onerror = event => reject(event.target.error)
  })
}

async function syncProtocols() {
  try {
    const db = await initDB()

    for (const protocolId of PROTOCOL_IDS) {
      const response = await fetch(`${BASE}protocols/${protocolId}.json`)
      if (!response.ok) continue
      const data = await response.json()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({ id: protocolId, ...data })
    }
  } catch (error) {
    console.warn('Protocol sync skipped', error)
  }
}

export function registerPWA() {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${BASE}sw.js`)
      .then(() => {
        if ('indexedDB' in window) {
          syncProtocols()
        }
      })
      .catch(error => {
        console.log('[Service Worker] Registration failed:', error)
      })
  })
}

