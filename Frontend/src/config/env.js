export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  socketUrl: import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
  appName: import.meta.env.VITE_APP_NAME || "StayByHour",
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "",
  },
};

export const isFirebaseConfigured = Boolean(env.firebase.apiKey && env.firebase.projectId);
export const isFirebasePushReady = Boolean(isFirebaseConfigured && env.firebase.vapidKey);

export default env;
