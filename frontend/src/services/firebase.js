import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBk7c5Fk2qtkc4eseaSpUJyw0eUT7bVSFU",
  authDomain: "golden-2eb3a.firebaseapp.com",
  projectId: "golden-2eb3a",
  storageBucket: "golden-2eb3a.firebasestorage.app",
  messagingSenderId: "710795720084",
  appId: "1:710795720084:web:db1556aea646a58423cb81",
  measurementId: "G-SMQJ1JL95E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let messaging = null;

try {
  // FCM messaging works only in secure environments or localhost, and supports browser service workers
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (err) {
  console.warn('Firebase Messaging is not supported on this browser/environment:', err.message);
}

export const requestFirebaseToken = async () => {
  if (!messaging) {
    console.warn('Firebase messaging is not initialized.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission was denied by the user.');
      return null;
    }

    // VAPID key provided by the user
    const vapidKey = 'BE38V8Wt7JYAeETHS8T8E0U88AgU1T0fWQDOqBxWpTDpSEmeXf-l6Qn7fHwNfm8hGunop2wcuW4_cxgJAOFFBkY';

    // Retrieve FCM token
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('An error occurred while retrieving Firebase token:', error);
    return null;
  }
};

export { app, messaging };
