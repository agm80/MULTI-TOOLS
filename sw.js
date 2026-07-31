// Bengkel service worker — lets the app open even with no internet.
// Bump CACHE_NAME whenever core files change to force old caches to clear.
const CACHE_NAME = 'bengkel-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/main.js',
  './js/helpers.js',
  './js/tools/harian.js',
  './js/tools/converters.js',
  './js/tools/text.js',
  './js/tools/image.js',
  './js/tools/dev.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first for same-origin GET requests, falling back to cache when offline.
// Cross-origin requests (Google Fonts, JsBarcode CDN, QR API) are left alone —
// those already have their own graceful "no internet" messages in the tools.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
