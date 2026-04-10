importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAP5swxqPQB3_Xcvd2d6Na7d8bD5Qeh1ro",
  authDomain: "weardynamite-test.firebaseapp.com",
  projectId: "weardynamite-test",
  storageBucket: "weardynamite-test.firebasestorage.app",
  messagingSenderId: "235583110370",
  appId: "1:235583110370:web:2864b29cf1b30dfc3572bb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/favicon.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
