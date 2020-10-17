const dataCacheName = 'data-cache-v1';
const cacheName = 'static-cache-v2';
const fileCache = ['/', 'db.js', 'index.html', 'index.js', 'style.css'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(cacheName)
            .then((cache) => cache.addAll(fileCache))
            .then(self.skipWaiting())
    ); console.log("Files pre-cached")
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== cacheName && key !== dataCacheName) {
                        return caches.delete(key);
                        console.log("Removing cache data");
                    };
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(dataCacheName).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(error => {
                        return cache.match(event.request);
                    });
            })
        );
        return;
    }
    event.respondWith(
        caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(response => {
                return response || fetch(event.request);
            });
        })
    );
});