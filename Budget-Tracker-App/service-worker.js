const CACHE_NAME = 'budget-app-cache-v1';
const urlsToCache = [
  '/index.html',
  '/budget.css',
  '/budget.js',
  '/manifest.json',
  '/budget.png',
  '/money-growth.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
