import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import "./index.css";

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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });
facebookProvider.addScope("email");

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState("مرحبا بك في نور");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsub();
  }, []);

  const showStatus = (msg) => setStatus(msg);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      showStatus("تم تسجيل الدخول عبر Google");
    } catch (err) {
      console.error(err);
      showStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, facebookProvider);
      showStatus("تم تسجيل الدخول عبر Facebook");
    } catch (err) {
      console.error(err);
      showStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      showStatus("تم تسجيل الدخول بالإيميل");
    } catch (err) {
      console.error(err);
      showStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      showStatus("تم إنشاء الحساب، يرجى التحقق من بريدك الإلكتروني");
    } catch (err) {
      console.error(err);
      showStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      showStatus("تم إرسال رابط استعادة كلمة المرور");
    } catch (err) {
      console.error(err);
      showStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      showStatus("تم تسجيل الخروج");
    } catch (err) {
      console.error(err);
      showStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "500px", margin: "40px auto", direction: "rtl" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          aria-hidden="true"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e8f5ee",
            border: "1px solid #cce9db",
            fontSize: "20px"
          }}
        >
          🔐
        </span>
        Login - Nour
      </h1>

      {currentUser && (
        <p>أنت مسجل: {currentUser.displayName || currentUser.email}</p>
      )}

      <form onSubmit={handleEmailLogin} style={{ display: "grid", gap: "10px" }}>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="كلمة السر"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          دخول بالإيميل
        </button>
      </form>

      <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
        <button onClick={handleSignup} disabled={loading}>
          إنشاء حساب
        </button>

        <button onClick={handleReset} disabled={loading}>
          نسيت كلمة السر
        </button>

        <button onClick={handleGoogle} disabled={loading}>
          الدخول عبر Google
        </button>

        <button onClick={handleFacebook} disabled={loading}>
          الدخول عبر Facebook
        </button>

        {currentUser && (
          <button onClick={handleLogout} disabled={loading}>
            تسجيل الخروج
          </button>
        )}
      </div>

      <p style={{ marginTop: "16px" }}>{status}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>
);
