const CACHE_NAME = 'entropass-ios-pwa-v1';

const CACHE_URLS = [
    'manifest.webmanifest',
    'icon.png',
    'index.html',
    'style.css',
    'main.js',
    'service-worker.js',
    'lib/typedarrays.js',
    'lib/base64.js',
    'lib/pbkdf2.js',
    'lib/sha512.js',
    'lib/entropass.js',
    'lib/punycode.js',
    'lib/publicsuffix.js'
];

function withCache(resolve) {
    return caches.open(CACHE_NAME).then(resolve);
}

function fetchAndCache(request, cache) {
    return fetch(request).then(response => {
        if (!response.ok)
            throw new TypeError('bad response status');
        return cache.put(request, response.clone()).then(_ => response);
    });
}

function cachedFetch(request, cache) {
    return cache.match(request).then(response =>
        response || fetchAndCache(request, cache))
}

// this will update all files in the cache if we can retrieve them
function download(cache) {
    return cache.addAll(CACHE_URLS);
}

// this will ensure that all files are cached, but not update cached files
function cacheAll(cache) {
    return Promise.all(CACHE_URLS.map(url => cachedFetch(url, cache)));
}

// install event fires when the service worker is successfully registered
// which happens each time the app is restarted
self.addEventListener('install', event => {
    event.waitUntil(withCache(cacheAll));
});

function clearStaleCaches(keep) {
    return caches.keys().then(keys =>
        Promise.all(keys.map(key =>
            key === keep ? Promise.resolve(false) : caches.delete(key)
        ))
    );
}

self.addEventListener('activate', event => {
    // using waitUntil here is very slow
    clearStaleCaches(CACHE_NAME);
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method === 'GET')
        event.respondWith(withCache(cache => cachedFetch(request, cache)));
});
