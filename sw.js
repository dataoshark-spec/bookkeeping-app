// Service Worker — 記帳 LEDGER 個人版
// 最單純的版本:cache 主程式讓 PWA 可離線開啟,字體不碰

const CACHE_VERSION = 'ledger-v547';
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

// Network first(有網拿新版),fallback cache(離線可用)
// 字體完全不碰:走瀏覽器自己處理
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;
  // 字體相關走網路,不經 SW
  if (req.url.includes('fonts.googleapis.com') || req.url.includes('fonts.gstatic.com')) {
    return;
  }
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response.ok && req.url.startsWith(self.location.origin)) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});
