const CACHE_NAME = 'usdv-platform-v1.2.1';
const STATIC_CACHE = 'static-v1.2.1';

// Cache static assets with hash
const STATIC_ASSETS = [
  '/assets/',
  '/lovable-uploads/',
  '/favicon.ico'
];

// Don't cache HTML files
const NO_CACHE_URLS = [
  '/',
  '/index.html',
  '/zh/',
  '/zh/referral',
  '/zh/stake',
  '/zh/user',
  '/zh/invest',
  '/zh/trade',
  '/zh/dashboard',
  '/zh/usdv',
  '/zh/whitepaper'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', CACHE_NAME);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Don't cache HTML files - always fetch from network
  if (NO_CACHE_URLS.some(path => url.pathname === path || url.pathname.startsWith(path))) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache static assets with hash (images, CSS, JS with hash)
  if (STATIC_ASSETS.some(path => url.pathname.startsWith(path)) || 
      url.pathname.includes('assets/') || 
      /\.[a-f0-9]{8}\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // For all other requests, try network first
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Version info
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});