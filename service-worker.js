// service-worker.js — caches the app shell (HTML/CSS/JS) so Almanac still
// opens when offline. Weather data itself is always fetched fresh from the
// network since it goes stale quickly.

const CACHE_NAME = 'almanac-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './storage.js',
  './weather.js',
  './charts.js',
  './ui.js',
  './app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle the app shell with cache-first; let API calls (weather,
  // geocoding) go straight to the network so data stays current.
  const url = new URL(request.url);
  const isShellRequest = url.origin === self.location.origin;

  if (!isShellRequest) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});
