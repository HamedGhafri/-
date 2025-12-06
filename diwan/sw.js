// Service Worker for Diwan PWA
const CACHE_NAME = 'diwan-v1.3';
const urlsToCache = [
    './',
    './index.html',
    './viewer.html',
    './categories.html',
    './search.html',
    './favorites.html',
    './playlists.html',
    './focus.html',
    './share-image.html',
    './style.css',
    './themes.css',
    './script.js',
    './themes.js',
    './poems.txt',
    './favicon.svg',
    './manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// Handle background sync for offline favorites
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    // Logic to sync favorites when back online
    console.log('Syncing favorites...');
}

// Push notification
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'قصيدة جديدة متاحة!',
        icon: './favicon.svg',
        badge: './favicon.svg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'اقرأ الآن',
                icon: './favicon.svg'
            },
            {
                action: 'close',
                title: 'إغلاق'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('مقتطفات ابن حمدان', options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});
