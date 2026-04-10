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

// إعدادات Firebase
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
let isBusy = false;

function mapAuthError(error) {
  const code = error?.code || "";

  switch (code) {
    case "auth/invalid-email":
      return "الإيميل غير صالح.";
    case "auth/missing-password":
      return "أدخل كلمة المرور.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "الإيميل أو كلمة السر غير صحيحة.";
    case "auth/wrong-password":
      return "كلمة السر غير صحيحة.";
    case "auth/email-already-in-use":
      return "هذا البريد الإلكتروني مستخدم مسبقًا.";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة. يجب أن تتكون من 6 أحرف على الأقل.";
    case "auth/too-many-requests":
      return "هناك عدد كبير من المحاولات. حاول لاحقًا.";
    case "auth/network-request-failed":
      return "توجد مشكلة في الاتصال بالإنترنت.";
    default:
      return error?.message || "وقع خطأ غير متوقع.";
  }
}

function setBusy(busy) {
  isBusy = busy;
  const controls = [
    loginBtn,
    createAccountBtn,
    resetPasswordBtn,
    googleBtn,
    facebookBtn,
    loginTabBtn,
    signupTabBtn,
    closeAuthBtn
  ];

  controls.forEach((btn) => {
    if (!btn) return;
    btn.disabled = busy;
  });
}

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
    setStatus("أدخل البريد الإلكتروني وكلمة المرور.", true);
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
  if (isBusy) return;
  const creds = getCredentials();
  if (!creds) return;

  try {
    setBusy(true);
    const userCredential = await signInWithEmailAndPassword(auth, creds.email, creds.password);
    const { user } = userCredential;

    if (!user.emailVerified) {
      await sendEmailVerification(user);
      await signOut(auth);
      setStatus("يجب تفعيل الحساب عبر البريد الإلكتروني أولًا. أعدنا إرسال رابط التفعيل.", true);
      return;
    }

    setStatus("تم تسجيل الدخول بنجاح.");
    closeAuthModal();
  } catch (error) {
    setStatus(mapAuthError(error), true);
  } finally {
    setBusy(false);
  }
});

createAccountBtn?.addEventListener("click", async () => {
  if (isBusy) return;
  const creds = getCredentials();
  if (!creds) return;

  try {
    setBusy(true);
    const userCredential = await createUserWithEmailAndPassword(auth, creds.email, creds.password);
    await sendEmailVerification(userCredential.user);
    await signOut(auth);
    setStatus("تم إنشاء الحساب. فعّل البريد الإلكتروني ثم سجّل الدخول.");
    passwordInput.value = "";
    setMode(false);
  } catch (error) {
    setStatus(mapAuthError(error), true);
  } finally {
    setBusy(false);
  }
});

resetPasswordBtn?.addEventListener("click", async () => {
  if (isBusy) return;
  const email = emailInput?.value?.trim();
  if (!email) {
    setStatus("أدخل البريد الإلكتروني لإرسال رابط الاستعادة.", true);
    return;
  }

  try {
    setBusy(true);
    await sendPasswordResetEmail(auth, email);
    setStatus("تم إرسال رابط استعادة كلمة المرور.");
  } catch (error) {
    setStatus(mapAuthError(error), true);
  } finally {
    setBusy(false);
  }
});

googleBtn?.addEventListener("click", async () => {
  if (isBusy) return;
  try {
    setBusy(true);
    await signInWithPopup(auth, loginProvider);
    setStatus("تم تسجيل الدخول عبر Google.");
    closeAuthModal();
  } catch (error) {
    setStatus(mapAuthError(error), true);
  } finally {
    setBusy(false);
  }
});

facebookBtn?.addEventListener("click", async () => {
  if (isBusy) return;
  try {
    setBusy(true);
    await signInWithPopup(auth, facebookProvider);
    setStatus("تم تسجيل الدخول عبر Facebook.");
    closeAuthModal();
  } catch (error) {
    setStatus(mapAuthError(error), true);
  } finally {
    setBusy(false);
  }
});

logoutBtn?.addEventListener("click", async () => {
  if (isBusy) return;
  try {
    setBusy(true);
    await signOut(auth);
    setStatus("تم تسجيل الخروج.");
  } catch (error) {
    setStatus(mapAuthError(error), true);
  } finally {
    setBusy(false);
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
