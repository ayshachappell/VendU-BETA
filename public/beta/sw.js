function isVendUAppCache(name) { return name.startsWith("vendu-main-") || name.startsWith("vendu-beta-"); }
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  try {
    const names = await caches.keys();
    await Promise.allSettled(names.filter(isVendUAppCache).map((name) => caches.delete(name)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window" });
    await Promise.allSettled(clients.map((client) => client.navigate(client.url)));
  } finally {
    await self.registration.unregister();
  }
})()));
