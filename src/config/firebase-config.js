// Shared Firebase placeholder config for tooling and future bundlers.
// Keep real values in .env locally or GitHub Actions secrets; never commit them.
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'REPLACE_ME',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'REPLACE_ME.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'REPLACE_ME',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'REPLACE_ME.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'REPLACE_ME',
  appId: process.env.FIREBASE_APP_ID || 'REPLACE_ME',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'REPLACE_ME'
};
