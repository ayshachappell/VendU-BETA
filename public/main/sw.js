const CACHE = "vendu-main-shell-v49";
const SHELL = [
  "/main/index.html",
  "/main/vendu-shared.css?v=49",
  "/main/vendu-api.js?v=14",
  "/main/vendu-tour.js?v=22",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name.startsWith("vendu-main-") && name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  const requestUrl = new URL(event.request.url);
  const cacheKey = new Request(requestUrl.href);
  const freshRequest = new Request(event.request, { cache: "no-store" });
  event.respondWith(
    fetch(freshRequest)
      .then((response) => {
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(cacheKey, response.clone()));
        return response;
      })
      .catch(() => caches.match(cacheKey).then((cached) => cached || caches.match("/main/index.html"))),
  );
});