// Service Worker — 記帳 LEDGER 個人版

const CACHE_VERSION = 'ledger-v1210';
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

// [v555VO] 同源 GET 改 Cache First + 背景更新(stale-while-revalidate):
//   先回快取秒開,同時背景抓新版更新快取,下次開啟即新版。
//   網路差/離線也不卡(不等網路逾時)。字體/Google 登入/Drive 維持走網路不攔截。
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;
  if (req.url.includes('fonts.googleapis.com') || req.url.includes('fonts.gstatic.com')) {
    return;
  }
  // Google 帳號 / Drive API 一律走網路,不快取、不攔截
  if (req.url.includes('accounts.google.com')
      || req.url.includes('googleapis.com')
      || req.url.includes('google.com/gsi')) {
    return;
  }
  // 跨域資源走網路(不攔截)
  if (!req.url.startsWith(self.location.origin)) return;

  // 同源:Cache First + 背景更新
  event.respondWith(
    caches.match(req).then((cached) => {
      // 背景抓新版(成功就更新快取),不阻塞回應
      const fetchPromise = fetch(req)
        .then((response) => {
          if (response && response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
          }
          return response;
        })
        .catch(() => null);
      // 有快取就秒回快取(背景靜默更新);沒有才等網路
      return cached || fetchPromise;
    })
  );
});
