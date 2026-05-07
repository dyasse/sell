const CACHE_VERSION = "nour-v6";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const API_CACHE = `${CACHE_VERSION}-api`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;
const AUDIO_MANIFEST_CACHE = `${CACHE_VERSION}-audio-manifest`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./quran.html",
  "./details.html",
  "./adhkar.html",
  "./duas.html",
  "./favorites.html",
  "./support.html",
  "./salat.html",
  "./styles.css",
  "./app-shell.js",
  "./script.js",
  "./quran.js",
  "./src/quran-sync.js",
  "./details.js",
  "./adhkar.js",
  "./duas.js",
  "./favorites.js",
  "./salat.js",
  "./monetization.js",
  "./adhkar.json",
  "./manifest.json",
  "./assets/favicon.png"
];

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin;
}

function isStaticAsset(requestUrl) {
  return (
    isSameOrigin(requestUrl) &&
    /\.(?:css|js|mjs|png|jpg|jpeg|gif|svg|webp|ico|json|woff2?)$/i.test(requestUrl.pathname)
  );
}

function isVersionedAsset(requestUrl) {
  return /(?:[.-][a-f0-9]{8,}|[?&]v=|[?&]hash=)/i.test(requestUrl.pathname + requestUrl.search);
}

function isApiRequest(request, requestUrl) {
  return (
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.hostname.endsWith("quran.com") ||
    request.headers.get("accept")?.includes("application/json")
  );
}

function isFontRequest(requestUrl) {
  return (
    requestUrl.hostname === "fonts.googleapis.com" ||
    requestUrl.hostname === "fonts.gstatic.com" ||
    /\.(?:woff2?|ttf|otf)$/i.test(requestUrl.pathname)
  );
}

function isAudioFileRequest(request, requestUrl) {
  return (
    request.destination === "audio" ||
    /\.(?:mp3|m4a|aac|ogg|opus|wav)$/i.test(requestUrl.pathname)
  );
}

function isAudioManifestRequest(requestUrl) {
  return /(?:audio[-_]?manifest|timings|timestamps|verse[-_]?timings)\.(?:json|txt)$/i.test(requestUrl.pathname);
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await Promise.all(
        APP_SHELL.map(async (asset) => {
          try {
            await cache.add(new Request(asset, { cache: "reload" }));
          } catch (error) {
            console.warn("Failed to precache asset", asset, error);
          }
        })
      );
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const validCaches = [STATIC_CACHE, RUNTIME_CACHE, API_CACHE, FONT_CACHE, AUDIO_MANIFEST_CACHE];

  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => !validCaches.includes(key)).map((key) => caches.delete(key))
    ))
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);

  if (isAudioFileRequest(request, requestUrl)) {
    // Do not cache full Quran audio files in Cache Storage; let the browser stream/range-request them.
    event.respondWith(fetch(request));
    return;
  }

  if (isApiRequest(request, requestUrl)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (isFontRequest(requestUrl)) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  if (isAudioManifestRequest(requestUrl)) {
    event.respondWith(staleWhileRevalidate(request, AUDIO_MANIFEST_CACHE));
    return;
  }

  if (isStaticAsset(requestUrl)) {
    event.respondWith(
      isVersionedAsset(requestUrl)
        ? cacheFirst(request, STATIC_CACHE)
        : staleWhileRevalidate(request, RUNTIME_CACHE)
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, RUNTIME_CACHE).catch(() => caches.match("./index.html"))
    );
  }
});
