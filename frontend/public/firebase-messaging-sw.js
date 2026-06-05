// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's FirebaseConfig.
firebase.initializeApp({
  apiKey: "AIzaSyBk7c5Fk2qtkc4eseaSpUJyw0eUT7bVSFU",
  authDomain: "golden-2eb3a.firebaseapp.com",
  projectId: "golden-2eb3a",
  storageBucket: "golden-2eb3a.firebasestorage.app",
  messagingSenderId: "710795720084",
  appId: "1:710795720084:web:db1556aea646a58423cb81",
  measurementId: "G-SMQJ1JL95E"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Golden Fisheries ERP';
  const notificationOptions = {
    body: payload.notification?.body || 'New operational update received.',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to redirect to appropriate views
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const payloadData = event.notification.data;
  if (!payloadData) return;

  const urlToOpen = new URL('/', self.location.origin);
  
  if (payloadData.type) {
    urlToOpen.searchParams.append('notif_type', payloadData.type);
  }
  if (payloadData.referenceId) {
    urlToOpen.searchParams.append('notif_ref_id', payloadData.referenceId);
  }
  if (payloadData.referenceModel) {
    urlToOpen.searchParams.append('notif_ref_model', payloadData.referenceModel);
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NAVIGATE',
            payload: payloadData
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen.toString());
      }
    })
  );
});
