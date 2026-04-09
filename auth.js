import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
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

const openAuthBtn = document.getElementById("openAuthBtn");
const closeAuthBtn = document.getElementById("closeAuthBtn");
const authModal = document.getElementById("authModal");
const authStatus = document.getElementById("authStatus");
const loginTabBtn = document.getElementById("loginTabBtn");
const signupTabBtn = document.getElementById("signupTabBtn");
const emailInput = document.getElementById("authEmailInput");
const passwordInput = document.getElementById("authPasswordInput");
const loginBtn = document.getElementById("loginEmailBtn");
const createAccountBtn = document.getElementById("createAccountBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const googleBtn = document.getElementById("loginGoogleBtn");
const facebookBtn = document.getElementById("loginFacebookBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

let isSignupMode = false;

function setStatus(message, isError = false) {
  if (!authStatus) return;
  authStatus.textContent = message;
  authStatus.style.color = isError ? "#991b1b" : "#334155";
  authStatus.style.background = isError ? "#fef2f2" : "#f8fafc";
}

function showAuthModal() {
  if (!authModal) return;
  authModal.classList.add("show");
  authModal.setAttribute("aria-hidden", "false");
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.classList.remove("show");
  authModal.setAttribute("aria-hidden", "true");
}

function getCredentials() {
  const email = emailInput?.value?.trim();
  const password = passwordInput?.value?.trim();

  if (!email || !password) {
    setStatus("دخل الإيميل وكلمة السر.", true);
    return null;
  }

  return { email, password };
}

function setMode(signupMode) {
  isSignupMode = signupMode;
  loginTabBtn?.classList.toggle("active", !signupMode);
  signupTabBtn?.classList.toggle("active", signupMode);
  createAccountBtn?.classList.toggle("hidden", !signupMode);
  loginBtn?.classList.toggle("hidden", signupMode);
  resetPasswordBtn?.classList.toggle("hidden", signupMode);
}

loginTabBtn?.addEventListener("click", () => setMode(false));
signupTabBtn?.addEventListener("click", () => setMode(true));
openAuthBtn?.addEventListener("click", showAuthModal);
closeAuthBtn?.addEventListener("click", closeAuthModal);

authModal?.addEventListener("click", (event) => {
  if (event.target === authModal) closeAuthModal();
});

loginBtn?.addEventListener("click", async () => {
  const creds = getCredentials();
  if (!creds) return;

  try {
    await signInWithEmailAndPassword(auth, creds.email, creds.password);
    setStatus("تم تسجيل الدخول بنجاح.");
    closeAuthModal();
  } catch (error) {
    setStatus(error.message, true);
  }
});

createAccountBtn?.addEventListener("click", async () => {
  const creds = getCredentials();
  if (!creds) return;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, creds.email, creds.password);
    await sendEmailVerification(userCredential.user);
    setStatus("تم إنشاء الحساب. تفقد الإيميل ديالك.");
    setMode(false);
  } catch (error) {
    setStatus(error.message, true);
  }
});

resetPasswordBtn?.addEventListener("click", async () => {
  const email = emailInput?.value?.trim();
  if (!email) {
    setStatus("دخل الإيميل باش نصيفطو رابط الاسترجاع.", true);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    setStatus("تصيفط ليك رابط استرجاع كلمة السر.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

googleBtn?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, loginProvider);
    setStatus("تم تسجيل الدخول عبر Google.");
    closeAuthModal();
  } catch (error) {
    setStatus(error.message, true);
  }
});

facebookBtn?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, facebookProvider);
    setStatus("تم تسجيل الدخول عبر Facebook.");
    closeAuthModal();
  } catch (error) {
    setStatus(error.message, true);
  }
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    setStatus("تم تسجيل الخروج.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    setStatus(`مرحبا ${user.displayName || user.email}`);
    logoutBtn?.classList.remove("hidden");
  } else {
    setStatus("مرحبا بك في نور");
    logoutBtn?.classList.add("hidden");
  }
});
