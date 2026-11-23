/* FNPOS-CGT Service Worker v4 — unified portail */
var CACHE = 'fnpos-unified-v4';
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
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetched = fetch(e.request).then(function(res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function() { return cached; });
      return cached || fetched;
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'skipWaiting') self.skipWaiting();
});
