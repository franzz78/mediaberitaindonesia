const CACHE_NAME = 'media-indonesia-cache-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json'
];

// Tahap Install Aset Utama
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mengamankan aset cache inti...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Tahap Aktivasi & Pembersihan Cache Lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Strategi Fetching: Network First falling back to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

