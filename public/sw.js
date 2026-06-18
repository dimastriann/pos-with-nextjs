const CACHE = 'pos-flow-v1';
const PRECACHE = ['/', '/login', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests for same-origin or static assets
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Skip Next.js HMR and API routes
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;
  if (url.pathname.startsWith('/api/')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res.ok && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      // Network-first for navigation, cache-first for assets
      if (e.request.mode === 'navigate') return network || cached;
      return cached || network;
    })
  );
});
