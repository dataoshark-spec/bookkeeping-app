// ============ Service Worker — 記帳 LEDGER 個人版 ============
// 升新版時:改 CACHE_VERSION 字串(同步參考 ledger.jsx 的 APP_VERSION)
// 使用者下次打開 PWA 時會自動清掉舊 cache、抓新版

const CACHE_VERSION = 'ledger-v532';
const CACHE_NAME = `${CACHE_VERSION}-cache`;

// 這些是要預先 cache 的檔(離線打開 PWA 也能載入主程式)
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './ledger.jsx',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
];

// 安裝:預先抓全部資源放 cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // 立刻接管,不用等 reload
  );
});

// 啟動:清掉舊版 cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // 立刻控制所有頁面
  );
});

// 攔截 fetch:Network First, fallback to Cache
// 有網時看到最新版,斷網時回退到 cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // 只處理 GET
  if (req.method !== 'GET') return;
  // 跳過 chrome-extension 等非 http(s) 請求
  if (!req.url.startsWith('http')) return;

  event.respondWith(
    fetch(req)
      .then((response) => {
        // 抓到 ok 的回應時更新 cache(只 cache 同源資源 + unpkg)
        if (response.ok && (req.url.startsWith(self.location.origin) || req.url.includes('unpkg.com'))) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
        }
        return response;
      })
      .catch(() => caches.match(req).then((cached) => cached || new Response('離線且無快取', { status: 503 })))
  );
});

// 接收主頁面訊息(例如「立刻啟用新版」)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
