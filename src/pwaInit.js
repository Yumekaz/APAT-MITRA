const DB_NAME = 'apatMitraDB';
const STORE_NAME = 'protocols';

// Initialize IndexedDB functionality
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Ensure the JSON files are stored in our IndexedDB
async function syncProtocols() {
    try {
        const db = await initDB();
        const protocolsToFetch = ['bleeding', 'burns', 'cpr'];

        for (const protocol of protocolsToFetch) {
            // Background fetch standard JSON
            const res = await fetch(`/protocols/${protocol}.json`);
            if (res.ok) {
                const data = await res.json();
                // Save to IndexedDB (UI not currently using this but requirement demands it's stored)
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                store.put({ id: protocol, ...data });
            }
        }
    } catch (err) {
        console.warn('Sync protocols failed (expected in offline mode)', err);
    }
}

// Register service worker and start DB sync
export function registerPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('[Service Worker] Registration successful with scope: ', registration.scope);

                    // Seed IndexedDB for requirement
                    if ('indexedDB' in window) {
                        syncProtocols();
                    }
                })
                .catch((err) => {
                    console.log('[Service Worker] Registration failed: ', err);
                });
        });
    }
}
