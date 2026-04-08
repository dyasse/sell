import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTYiaVkb_PL5pG73v0nhKgwR5TAif_xnc",
  authDomain: "nour-30704.firebaseapp.com",
  projectId: "nour-30704",
  storageBucket: "nour-30704.firebasestorage.app",
  messagingSenderId: "387739904110",
  appId: "1:387739904110:web:33600e65dfb0ed72f91e7f",
  measurementId: "G-8K72MGRLFG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
