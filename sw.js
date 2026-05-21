// Service Worker — 記帳 LEDGER 個人版

const CACHE_VERSION = 'ledger-v709';
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
