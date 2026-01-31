// Firebase Cloud Messaging Service Worker
// This file MUST be in the public folder and named exactly: firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyBj4Brq1P8a8tIL4nRjA1eLI6ryElgSBTQ",
    authDomain: "campuslostfound-45b13.firebaseapp.com",
    projectId: "campuslostfound-45b13",
    storageBucket: "campuslostfound-45b13.firebasestorage.app",
    messagingSenderId: "654876539368",
    appId: "1:654876539368:web:1f0401d199dccf13fe0c5d"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Campus Lost & Found';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/logo_icon.png',
        badge: '/logo_icon.png',
        tag: payload.data?.itemId || 'notification',
        data: {
            clickAction: payload.data?.clickAction || '/',
            itemId: payload.data?.itemId
        },
        requireInteraction: true,
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

    event.notification.close();

    const clickAction = event.notification.data?.clickAction || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If a window is already open, focus it and navigate
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        client.navigate(clickAction);
                        return;
                    }
                }
                // Otherwise, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(clickAction);
                }
            })
    );
});
