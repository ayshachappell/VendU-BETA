// One-release cleanup worker. It replaces every older VendU Beta worker,
// removes only this build's app-shell caches, refreshes open copies, and then
// permanently unregisters itself. Installability remains manifest-based.
function isBetaAppCache(name) {
  return /^vendu-beta-v\d+$/.test(name);
}

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.allSettled(
          cacheNames.filter(isBetaAppCache).map((name) => caches.delete(name)),
        );
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: 'window' });
        await Promise.allSettled(
          windowClients.map((client) => client.navigate(client.url)),
        );
      } finally {
        await self.registration.unregister();
      }
    })(),
  ),
);
