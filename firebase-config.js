import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const runtimeEnv =
  typeof process !== "undefined" && process.env
    ? process.env
    : typeof window !== "undefined"
      ? window.NOUR_ENV || {}
      : {};

// Configure these values through .env locally and GitHub Actions secrets in CI.
const firebaseConfig = {
  apiKey: runtimeEnv.FIREBASE_API_KEY || "REPLACE_ME",
  authDomain: runtimeEnv.FIREBASE_AUTH_DOMAIN || "REPLACE_ME.firebaseapp.com",
  projectId: runtimeEnv.FIREBASE_PROJECT_ID || "REPLACE_ME",
  storageBucket: runtimeEnv.FIREBASE_STORAGE_BUCKET || "REPLACE_ME.appspot.com",
  messagingSenderId: runtimeEnv.FIREBASE_MESSAGING_SENDER_ID || "REPLACE_ME",
  appId: runtimeEnv.FIREBASE_APP_ID || "REPLACE_ME",
  measurementId: runtimeEnv.FIREBASE_MEASUREMENT_ID || "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
