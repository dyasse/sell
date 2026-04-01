const CACHE_NAME = "nour-v3";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/quran.html",
  "/details.html",
  "/adhkar.html",
  "/duas.html",
  "/favorites.html",
  "/support.html",
  "/salat.html",
  "/styles.css",
  "/script.js",
  "/quran.js",
  "/details.js",
  "/adhkar.js",
  "/duas.js",
  "/favorites.js",
  "/salat.js",
  "/adhkar.json",
  "/manifest.json",
  "/assets/favicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();

          if (
            request.url.startsWith(self.location.origin) &&
            networkResponse.status === 200
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
