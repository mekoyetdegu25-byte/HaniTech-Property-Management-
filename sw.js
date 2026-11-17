const CACHE_NAME = 'hanitech-property-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') return caches.match('./index.html');
    })
  );
});
