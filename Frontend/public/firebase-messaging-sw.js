/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// These values are safe to hardcode in a service worker (they're public client
// identifiers, not secrets) — but the build has no access to import.meta.env
// here, so this file is a static template. Fill in your Firebase project's
// web config values below to enable background push notifications.
firebase.initializeApp({
  apiKey: "AIzaSyDS0p7qi7NlNcDxHrNqAKsniqQWF7yGIrM",
  authDomain: "bullrise-42b1c.firebaseapp.com",
  projectId: "bullrise-42b1c",
  messagingSenderId: "122079470144",
  appId: "1:122079470144:web:8a3a69b2678dd86052f5a5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "StayByHour", {
    body: body || "",
    icon: "/favicon.svg",
  });
});
