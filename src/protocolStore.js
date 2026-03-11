const DB_NAME = 'apatMitraDB'
const STORE_NAME = 'protocols'
const PROTOCOL_IDS = ['bleeding', 'burns', 'cpr', 'fracture']

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

export async function syncProtocolsToStore(baseUrl) {
  const db = await initDB()

  for (const protocolId of PROTOCOL_IDS) {
    const response = await fetch(`${baseUrl}protocols/${protocolId}.json`)
    if (!response.ok) continue

    const data = await response.json()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ id: protocolId, ...data })
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = event => reject(event.target.error)
      tx.onabort = event => reject(event.target.error)
    })
  }
}

export async function loadProtocolsFromStore() {
  const db = await initDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const request = tx.objectStore(STORE_NAME).getAll()

  const records = await new Promise((resolve, reject) => {
    request.onsuccess = event => resolve(event.target.result ?? [])
    request.onerror = event => reject(event.target.error)
  })

  return Object.fromEntries(records.map(record => [record.id, record]))
}
