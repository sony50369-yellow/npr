const CACHE = 'app-hub-fastopen-v1';
const ASSETS = ['./','./index.html','./style.css','./app.js','./apps.json','./icon-192.png','./icon-512.png','./favicon.png','./manifest.json'];
self.addEventListener('install', e => {e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate', e => {e.waitUntil(self.clients.claim());});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone(); caches.open(CACHE).then(c=>c.put(e.request, clone)); return res;
    }).catch(()=>cached))
  );
});