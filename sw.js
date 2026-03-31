if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker خدام بنجاح!'))
      .catch(err => console.log('وقع مشكل في الـ Service Worker', err));
  });
}
const CACHE_NAME = 'nour-v1';
// ليستة ديال كاع الملفات اللي بغيتي تخليهم خدامين بلا أنترنيت
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/quran.html',
  '/adhkar.html',
  '/salat.html',
  '/details.html',
  '/styles.css',
  '/script.js',
  '/quran.js',
  '/adhkar.js',
  '/salat.js',
  '/details.js',
  '/adhkar.json',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn-icons-png.flaticon.com/512/3069/3069172.png'
];

// مرحلة التثبيت: كيشد الملفات ويحطهم في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// مرحلة الاستجابة: ملي المستخدم كيطلب صفحة، كيشوف واش كاين ف الكاش أولاً
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
const CACHE_NAME = 'nour-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/quran.html',
  '/details.html',
  '/salat.html',
  '/adhkar.html',
  '/duas.html', // جديد
  '/styles.css',
  '/script.js',
  '/quran.js',
  '/details.js',
  '/salat.js',
  '/duas.js', // جديد
  'https://cdn-icons-png.flaticon.com/512/3208/3208035.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
