import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVixG188LWr0s-y3bhQsBerXK4YK-Al2E",
  authDomain: "nour-3f6d4.firebaseapp.com",
  projectId: "nour-3f6d4",
  storageBucket: "nour-3f6d4.firebasestorage.app",
  messagingSenderId: "301905677274",
  appId: "1:301905677274:web:1427326a07085430b0cee3",
  measurementId: "G-G92Q1BWMBT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export objects bach n-khdmo bihom f les pages khrin
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
