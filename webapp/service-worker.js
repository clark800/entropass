const CACHE_NAME = 'entropass-ios-pwa-v1';

const CACHE_FILES = [
    'manifest.webmanifest',
    'index.html',
    'entropass.css',
    'main.js',
    'service-worker.js',
    'icon.png'
];

// install event fires when the service worker is successfully registered
self.addEventListener('install', event =>
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
);

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response =>
            response ? response : fetch(event.request)
        )
    )
});
