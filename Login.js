import React, { useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase-config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState("مرحبا بك في نور");
  const [statusType, setStatusType] = useState("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  const showStatus = (message, type = "default") => {
    setStatus(message);
    setStatusType(type);
  };

  const mapError = (err) => {
    const code = err?.code || "";

    switch (code) {
      case "auth/invalid-email":
        return "الإيميل غير صالح.";
      case "auth/missing-password":
        return "دخل كلمة السر.";
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "الإيميل أو كلمة السر غير صحيحة.";
      case "auth/wrong-password":
        return "كلمة السر غير صحيحة.";
      case "auth/email-already-in-use":
        return "هاد الإيميل مستعمل من قبل.";
      case "auth/weak-password":
        return "كلمة السر ضعيفة. خاصها تكون 6 حروف أو أكثر.";
      case "auth/popup-closed-by-user":
        return "تسدات نافذة تسجيل الدخول قبل الإكمال.";
      case "auth/popup-blocked":
        return "النافذة تمنعات من المتصفح. فعل popups وجرب مرة أخرى.";
      case "auth/account-exists-with-different-credential":
        return "هاد الإيميل مربوط بطريقة دخول أخرى.";
      case "auth/too-many-requests":
        return "كاين بزاف ديال المحاولات. جرب من بعد.";
      case "auth/network-request-failed":
        return "كاين مشكل فالإنترنت.";
      default:
        return err?.message || "وقع خطأ غير متوقع.";
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      showStatus("تم تسجيل الدخول عبر Google بنجاح.", "success");

      setTimeout(() => {
        window.location.href = "/";
      }, 700);
    } catch (err) {
      showStatus(mapError(err), "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, facebookProvider);
      showStatus("تم تسجيل الدخول عبر Facebook بنجاح.", "success");

      setTimeout(() => {
        window.location.href = "/";
      }, 700);
    } catch (err) {
      showStatus(mapError(err), "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showStatus("دخل الإيميل وكلمة السر.", "error");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      showStatus("تم تسجيل الدخول بنجاح.", "success");

      setTimeout(() => {
        window.location.href = "/";
      }, 700);
    } catch (err) {
      showStatus(mapError(err), "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      showStatus("دخل الإيميل وكلمة السر.", "error");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      showStatus("تم إنشاء الحساب. تفقد الإيميل ديالك للتفعيل.", "success");
    } catch (err) {
      showStatus(mapError(err), "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      showStatus("دخل الإيميل باش نصيفطو ليك رابط استرجاع كلمة السر.", "error");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      showStatus("تصيفط ليك رابط استرجاع كلمة السر للإيميل.", "success");
    } catch (err) {
      showStatus(mapError(err), "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      showStatus("تم تسجيل الخروج.", "success");
    } catch (err) {
      showStatus(mapError(err), "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = {
    default: {
      background: "#f8fafc",
      color: "#0f172a",
      border: "1px solid #e2e8f0"
    },
    success: {
      background: "#ecfdf5",
      color: "#166534",
      border: "1px solid #bbf7d0"
    },
    error: {
      background: "#fef2f2",
      color: "#991b1b",
      border: "1px solid #fecaca"
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7faf9 0%, #f1f5f9 100%)",
        padding: "24px",
        direction: "rtl",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 18px 48px rgba(16, 32, 49, 0.08)",
          border: "1px solid #e5e7eb"
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#14532d" }}>تسجيل الدخول - نور</h2>

        <p style={{ color: "#64748b", lineHeight: "1.8", marginBottom: "18px" }}>
          سجل الدخول بالإيميل أو عبر Google و Facebook.
        </p>

        {currentUser && (
          <div
            style={{
              marginBottom: "16px",
              background: "#eef8f3",
              border: "1px solid #dcefe5",
              color: "#166534",
              borderRadius: "14px",
              padding: "12px 14px",
              fontWeight: "bold"
            }}
          >
            أنت مسجل: {currentUser.displayName || currentUser.email || "مستخدم"}
          </div>
        )}

        <form onSubmit={handleEmailLogin} style={{ display: "grid", gap: "12px" }}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #dbe2e8",
              outline: "none"
            }}
          />

          <input
            type="password"
            placeholder="كلمة السر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #dbe2e8",
              outline: "none"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#1f6f50",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {loading ? "جاري المعالجة..." : "دخول بالإيميل"}
          </button>
        </form>

        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              background: "#eef3f1",
              color: "#0f172a",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            إنشاء حساب
          </button>

          <button
            onClick={handleResetPassword}
            disabled={loading}
            style={{
              background: "#eef3f1",
              color: "#0f172a",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            نسيت كلمة السر
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "18px 0",
            color: "#64748b",
            fontSize: "14px"
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span>أو</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              background: "#ffffff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            الدخول عبر Google
          </button>

          <button
            onClick={handleFacebook}
            disabled={loading}
            style={{
              background: "#1877f2",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            الدخول عبر Facebook
          </button>

          {currentUser && (
            <button
              onClick={handleLogout}
              disabled={loading}
              style={{
                background: "#eef3f1",
                color: "#111827",
                border: "none",
                borderRadius: "14px",
                padding: "14px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              تسجيل الخروج
            </button>
          )}
        </div>

        <div
          style={{
            marginTop: "16px",
            borderRadius: "14px",
            padding: "12px 14px",
            lineHeight: "1.8",
            ...statusStyles[statusType]
          }}
        >
          {status}
        </div>
      </div>
    </div>
  );
};

export default Login;
