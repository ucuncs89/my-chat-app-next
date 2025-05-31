// console.log('Service Worker Loaded');

self.addEventListener('install', (event) => {
    // console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
    // console.log('Service Worker activated');
});

self.addEventListener('push', function(event) {
    // console.log('Push notification received', event.data?.text());
    const options = {
        body: event.data?.text() || 'No message content',
        icon: '/vercel.svg',
        badge: '/vercel.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('New Chat Message', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    // console.log('Notification clicked', event);
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/chat')
    );
});
