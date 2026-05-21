/* QLTC service worker — offline-first shell caching */
const VERSION = 'qltc-v1.2.0';
const CORE_CACHE = `${VERSION}-core`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const CORE_ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './transactions.html',
  './budgets.html',
  './goals.html',
  './reports.html',
  './accounts.html',
  './settings.html',
  './splits.html',
  './login.html',
  './signup.html',
  './manifest.json',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/pages/dashboard.css',
  './css/pages/transactions.css',
  './css/pages/budgets.css',
  './css/pages/goals.css',
  './css/pages/reports.css',
  './css/pages/accounts.css',
  './css/pages/settings.css',
  './css/pages/auth.css',
  './css/pages/splits.css',
  './js/modules/storage.js',
  './js/modules/store.js',
  './js/modules/shell.js',
  './js/modules/theme.js',
  './js/modules/format.js',
  './js/modules/icons.js',
  './js/modules/ui.js',
  './js/modules/router.js',
  './js/modules/charts.js',
  './js/modules/mockdata.js',
  './js/pages/dashboard.js',
  './js/pages/transactions.js',
  './js/pages/budgets.js',
  './js/pages/goals.js',
  './js/pages/reports.js',
  './js/pages/accounts.js',
  './js/pages/settings.js',
  './js/pages/splits.js',
  './js/pages/login.js',
  './js/pages/signup.js',
  './assets/images/brand.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) =>
      Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isHTML = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./dashboard.html')))
    );
    return;
  }

  if (isSameOrigin) {
    // Network-first for same-origin JS/CSS/JSON so updated app code reaches users immediately.
    // Fall back to cache when offline.
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Cross-origin (fonts, CDN libs): stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
