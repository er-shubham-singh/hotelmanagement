import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import { config } from "../config/env.js";

export const isFirebaseConfigured = Boolean(
  config.firebase.serviceAccountJson || config.firebase.serviceAccountPath
);

let app = null;

const loadServiceAccount = () => {
  if (config.firebase.serviceAccountJson) {
    return JSON.parse(config.firebase.serviceAccountJson);
  }
  if (config.firebase.serviceAccountPath) {
    return JSON.parse(fs.readFileSync(config.firebase.serviceAccountPath, "utf-8"));
  }
  return null;
};

if (isFirebaseConfigured) {
  try {
    const serviceAccount = loadServiceAccount();
    app = initializeApp({ credential: cert(serviceAccount) });
    // eslint-disable-next-line no-console
    console.log(`[firebase] Admin SDK initialized for project "${serviceAccount.project_id}"`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[firebase] Failed to initialize firebase-admin — push notifications disabled:", error.message);
    app = null;
  }
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "[firebase] No FIREBASE_SERVICE_ACCOUNT configured — push notifications disabled. " +
      "In-app + realtime notifications still work."
  );
}

// Verifies a Firebase Auth ID token (e.g. from the frontend's Google
// sign-in popup) against the same Firebase project used for FCM push.
export const verifyGoogleIdToken = async (idToken) => {
  if (!app) {
    throw new Error("Firebase Admin is not configured (FIREBASE_SERVICE_ACCOUNT_JSON/PATH) — cannot verify Google sign-in");
  }
  return getAuth(app).verifyIdToken(idToken);
};

export const sendPush = async (deviceTokens, { title, body, data = {} }) => {
  if (!app || !deviceTokens?.length) return { successCount: 0, failureCount: 0 };

  const stringData = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]));

  try {
    const response = await getMessaging(app).sendEachForMulticast({
      tokens: deviceTokens,
      notification: { title, body },
      data: stringData,
    });
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[firebase] sendPush failed:", error.message);
    return { successCount: 0, failureCount: deviceTokens.length };
  }
};

export default { isFirebaseConfigured, sendPush, verifyGoogleIdToken };
