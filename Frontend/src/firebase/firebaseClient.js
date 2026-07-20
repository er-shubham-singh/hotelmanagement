import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";
import { env, isFirebaseConfigured, isFirebasePushReady } from "../config/env.js";
import { registerDeviceToken } from "../api/notification.api.js";

let app = null;
let messaging = null;

// Single shared Firebase app instance — reused by both FCM (messaging) and
// Google sign-in (auth), so it's only ever initialized once.
export const getFirebaseApp = () => {
  if (!isFirebaseConfigured) return null;
  if (app) return app;
  app = getApps().length
    ? getApps()[0]
    : initializeApp({
        apiKey: env.firebase.apiKey,
        authDomain: env.firebase.authDomain,
        projectId: env.firebase.projectId,
        messagingSenderId: env.firebase.messagingSenderId,
        appId: env.firebase.appId,
      });
  return app;
};

const initMessaging = async () => {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (messaging) return messaging;

  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  messaging = getMessaging(firebaseApp);
  return messaging;
};

// Requests browser notification permission, registers the FCM device token
// with the backend, and wires up foreground message toasts. Safe to call
// even when Firebase isn't configured — it just no-ops.
export const initPushNotifications = async () => {
  if (!isFirebasePushReady) {
    if (isFirebaseConfigured) {
      // eslint-disable-next-line no-console
      console.warn("[firebase] Firebase is configured but VITE_FIREBASE_VAPID_KEY is missing — browser push disabled.");
    }
    return;
  }

  try {
    const msg = await initMessaging();
    if (!msg) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(msg, { vapidKey: env.firebase.vapidKey, serviceWorkerRegistration: registration });

    if (token) {
      await registerDeviceToken(token);
    }

    onMessage(msg, (payload) => {
      toast(payload.notification?.title || "New notification", { icon: "🔔" });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("[firebase] Push notification setup failed:", error.message);
  }
};

// Opens the Google sign-in popup and returns the Firebase ID token, which
// the backend verifies via firebase-admin (POST /auth/google).
export const signInWithGoogle = async () => {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    throw new Error("Google sign-in isn't configured on this deployment.");
  }

  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return idToken;
};

export default { getFirebaseApp, initPushNotifications, signInWithGoogle };
