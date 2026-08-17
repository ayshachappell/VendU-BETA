// One-release cleanup worker. It replaces every older VendU Main worker,
// removes only this build's app-shell caches and then
// permanently unregisters itself. Installability remains manifest-based.
function isMainAppCache(name) {
  return /^vendu-main-v\d+$/.test(name);
}

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.allSettled(
          cacheNames.filter(isMainAppCache).map((name) => caches.delete(name)),
        );
        await self.clients.claim();
      } finally {
        await self.registration.unregister();
      }
    })(),
  ),
);
