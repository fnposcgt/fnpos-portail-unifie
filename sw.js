/* FNPOS-CGT Service Worker v5 — unified portail — network-first */
var CACHE = 'fnpos-unified-v5';
var STATIC = ['./'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(STATIC); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;
  /* Pass through Supabase API calls */
  if (url.indexOf('supabase.co') >= 0) return;
  /* NETWORK-FIRST: always try network, fall back to cache only if offline */
  e.respondWith(
    fetch(e.request).then(function(res) {
      if (res && res.status === 200) {
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'skipWaiting') self.skipWaiting();
});
