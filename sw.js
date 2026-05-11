// ============ Service Worker — 記帳 LEDGER 個人版 ============
// 升新版時:改 CACHE_VERSION 字串(同步參考 ledger.jsx 的 APP_VERSION)
// 使用者下次打開 PWA 時會自動清掉舊 cache、抓新版

const CACHE_VERSION = 'ledger-v544';
const CACHE_NAME = `${CACHE_VERSION}-cache`;

// 預先 cache 的檔(離線打開 PWA 也能載入主程式)
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './ledger.js',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
];

// 安裝:預先抓全部資源放 cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
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
      .then(() => self.clients.claim())
  );
});

// ============ Fetch 策略(分類處理,啟動最快) ============
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  const url = req.url;

  // [策略 1] Google Fonts CSS:走網路,不 cache(避免 cache 卡死)
  if (url.includes('fonts.googleapis.com')) {
    event.respondWith(fetch(req).catch(() => caches.match(req).then((c) => c || new Response('', { status: 503 }))));
    return;
  }

  // [策略 2] 字體檔(gstatic / jsDelivr 的 woff2):Cache First(字體幾乎不變,從 cache 讀超快)
  if (url.includes('fonts.gstatic.com') || (url.includes('cdn.jsdelivr.net') && url.match(/\.(woff2?|ttf|otf)$/))) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // [策略 3] React / 主程式 / 其他靜態資源:Cache First(超快啟動)
  // 同源資源 + jsDelivr/unpkg 的 JS,有 cache 直接用,沒有才去網路
  const isStaticAsset = (
    url.startsWith(self.location.origin) ||
    url.includes('cdn.jsdelivr.net') ||
    url.includes('unpkg.com')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // 背景偷偷更新(不阻塞使用者)
          fetch(req).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, response));
            }
          }).catch(() => {});
          return cached;
        }
        // 沒 cache 才去網路抓
        return fetch(req).then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
          }
          return response;
        }).catch(() => new Response('離線且無快取', { status: 503 }));
      })
    );
    return;
  }

  // [策略 4] 其他:走網路,失敗才回退 cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((c) => c || new Response('', { status: 503 })))
  );
});

// 接收主頁面訊息(立刻啟用新版)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
