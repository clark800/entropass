const CACHE_NAME = 'entropass-ios-pwa-v1';

const CACHE_FILES = [
    'manifest.webmanifest',
    'index.html',
    'entropass.css',
    'main.js',
    'service-worker.js',
    'icon.png'
];

function uncachedFetch(request) {
    return fetch(request, { cache: 'no-cache' });
}

function download() {
    return caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
}

// install event fires when the service worker is successfully registered
// which happens each time the app is restarted. this will update all files
// in the cache if we can retrieve them.
self.addEventListener('install', event => {
    event.waitUntil(download());
});

function clearStaleCaches(keep) {
    return caches.keys().then(keys => {
        return Promise.all(keys.map(key => {
            if (key !== keep)
                return caches.delete(key);
        }));
    });
}

self.addEventListener('activate', event => {
    // using waitUntil here is very slow
    clearStaleCaches(CACHE_NAME);
});

function cachedFetch(event) {
    return caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(response =>
            response || fetch(event.request)));
}

self.addEventListener('fetch', event => {
    if (event.request.method === 'GET')
        event.respondWith(cachedFetch(event));
});
