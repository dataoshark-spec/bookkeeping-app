// Service Worker ??閮董 LEDGER ?犖??
const CACHE_VERSION = 'ledger-1150719C';
const CACHE_NAME = `${CACHE_VERSION}-cache`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './ledger.js',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// [v555VO] ?? GET ??Cache First + ??湔(stale-while-revalidate):
//   ??敹怠?蝘?,??????啣翰??銝活???單??//   蝬脰楝撌??Ｙ?銋???銝?蝬脰楝?暹?)??擃?Google ?餃/Drive 蝬剜?韏啁雯頝臭????self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;
  if (req.url.includes('fonts.googleapis.com') || req.url.includes('fonts.gstatic.com')) {
    return;
  }
  // Google 撣唾? / Drive API 銝敺粥蝬脰楝,銝翰???
  if (req.url.includes('accounts.google.com')
      || req.url.includes('googleapis.com')
      || req.url.includes('google.com/gsi')) {
    return;
  }
  // 頝典?鞈?韏啁雯頝?銝???
  if (!req.url.startsWith(self.location.origin)) return;

  // ??:Cache First + ??湔
  event.respondWith(
    caches.match(req).then((cached) => {
      // ??????撠望?啣翰??,銝憛???      const fetchPromise = fetch(req)
        .then((response) => {
          if (response && response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
          }
          return response;
        })
        .catch(() => cached || new Response('', { status: 504, statusText: 'Offline' })); // [v555AEJ] ?Ｙ?銝敹怠????? Response,?踹? respondWith(null) ?
      // ?翰?停蝘?敹怠?(????湔);瘝???蝬脰楝
      return cached || fetchPromise;
    })
  );
});


