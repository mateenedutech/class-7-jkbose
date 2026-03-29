// JKBOSE Class 7 SST App - Service Worker
// Author: Mateen Yousuf | School Education Department, J&K

const CACHE_NAME = 'jkbose-sst7-v1.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './author.jpg'
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE.map(url => {
        return new Request(url, { cache: 'reload' });
      })).catch(err => {
        console.log('[SW] Cache failed for some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache the new response for future use
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed, serve offline page
        return caches.match('./index.html');
      });
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});

// Push notifications (placeholder)
self.addEventListener('push', (event) => {
  const title = 'JKBOSE Class 7 SST';
  const options = {
    body: event.data ? event.data.text() : 'Time to study!',
    icon: './author.jpg',
    badge: './author.jpg'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
