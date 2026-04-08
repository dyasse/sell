import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// 🔥 CONFIG ديالك
const firebaseConfig = {
  apiKey: "AIzaSyDTYiaVkb_PL5pG73v0nhKgwR5TAif_xnc",
  authDomain: "nour-30704.firebaseapp.com",
  projectId: "nour-30704",
  storageBucket: "nour-30704.firebasestorage.app",
  messagingSenderId: "387739904110",
  appId: "1:387739904110:web:33600e65dfb0ed72f91e7f",
  measurementId: "G-8K72MGRLFG"
};

// init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// elements
const emailBtn = document.getElementById("loginEmailBtn");
const googleBtn = document.getElementById("loginGoogleBtn");
const facebookBtn = document.getElementById("loginFacebookBtn");

// 🔹 EMAIL LOGIN SIMPLE (prompt)
emailBtn?.addEventListener("click", async () => {
  const email = prompt("دخل الإيميل:");
  const password = prompt("دخل كلمة السر:");

  if (!email || !password) return;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("تم تسجيل الدخول");
  } catch (e) {
    // إذا ماكانش حساب → نسجلوه
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("تم إنشاء الحساب");
    } catch (err) {
      alert("خطأ: " + err.message);
    }
  }
});

// 🔹 GOOGLE
googleBtn?.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Google error");
    console.log(e);
  }
});

// 🔹 FACEBOOK
facebookBtn?.addEventListener("click", async () => {
  const provider = new FacebookAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Facebook error");
    console.log(e);
  }
});

// 🔹 STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("user:", user.email);
  } else {
    console.log("no user");
  }
});
