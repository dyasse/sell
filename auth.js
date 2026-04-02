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
  apiKey: "AIzaSyAVixG188LWr0s-y3bhQsBerXK4YK-Al2E",
  authDomain: "nour-3f6d4.firebaseapp.com",
  projectId: "nour-3f6d4",
  storageBucket: "nour-3f6d4.firebasestorage.app",
  messagingSenderId: "301905677274",
  appId: "1:301905677274:web:1427326a07085430b0cee3"
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
