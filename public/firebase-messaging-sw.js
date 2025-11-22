// firebase-messaging-sw.js
// Importar los scripts de Firebase
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// ⚠️ USA LA MISMA CONFIGURACIÓN QUE EN TU HTML
firebase.initializeApp({
    apiKey: "AIzaSyBEX8QtIJAXsQzmdQYOmYChHB4SP_O0eaE",
    authDomain: "foraria-ar.firebaseapp.com",
    projectId: "foraria-ar",
    storageBucket: "foraria-ar.firebasestorage.app",
    messagingSenderId: "346785067214",
    appId: "1:346785067214:web:f625198c0ece9a0086e09f"
});

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Manejar notificaciones cuando la app está en background
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en background:', payload);
    
    const notificationTitle = payload.notification?.title || 'Foraria';
    const notificationOptions = {
        body: payload.notification?.body || 'Nueva notificación',
        icon: payload.notification?.icon || 'https://via.placeholder.com/128',
        badge: 'https://via.placeholder.com/96',
        data: payload.data,
        tag: payload.notification?.tag || 'foraria-notification',
        requireInteraction: false
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clicks en las notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);
    
    event.notification.close();
    
    // Abrir o enfocar la app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no, abrir una nueva ventana
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});
