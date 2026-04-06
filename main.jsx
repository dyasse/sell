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
  apiKey: "AIzaSyAVixG188LWr0s-y3bhQsBerXK4YK-Al2E",
  authDomain: "nour-3f6d4.firebaseapp.com",
  projectId: "nour-3f6d4",
  storageBucket: "nour-3f6d4.firebasestorage.app",
  messagingSenderId: "301905677274",
  appId: "1:301905677274:web:1427326a07085430b0cee3"
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
      showStatus("تم إنشاء الحساب، تفقد الإيميل ديالك");
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
      showStatus("تصيفط ليك رابط استرجاع كلمة السر");
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
      <h1>Login - Nour</h1>

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
