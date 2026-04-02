import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// 🔥 دير config ديالك هنا
const firebaseConfig = {
  apiKey: "PUT_YOUR_API_KEY",
  authDomain: "PUT_YOUR_PROJECT.firebaseapp.com",
  projectId: "PUT_YOUR_PROJECT_ID",
  storageBucket: "PUT_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PUT_ID",
  appId: "PUT_APP_ID"
};

// init firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================
// 👤 USER BAR
// ==========================
function setupUserBar() {
  const userBar = document.getElementById("supportUserBar");
  const userText = document.getElementById("supportUserText");

  if (!userBar || !userText) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userBar.classList.add("show");

      const name = user.displayName || user.email || "مستخدم";
      userText.textContent = `أنت مسجل: ${name}`;
    } else {
      userBar.classList.remove("show");
    }
  });
}

// ==========================
// 📋 COPY WALLET
// ==========================
async function copyWallet() {
  const walletBox = document.getElementById("walletAddress");
  const copyBtn = document.getElementById("copyWalletBtn");

  if (!walletBox) return;

  const text = walletBox.textContent.trim();

  if (!text) {
    alert("ما كاينش عنوان للمحفظة");
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }

    // 🔥 feedback UI
    if (copyBtn) {
      const old = copyBtn.innerHTML;

      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ';
      copyBtn.style.background = "#dcfce7";
      copyBtn.style.color = "#166534";

      setTimeout(() => {
        copyBtn.innerHTML = old;
        copyBtn.style.background = "";
        copyBtn.style.color = "";
      }, 1500);
    }
  } catch (err) {
    console.error("copy error:", err);
    alert("تعذر النسخ");
  }
}

// ==========================
// ⚙️ INIT
// ==========================
function init() {
  setupUserBar();

  const copyBtn = document.getElementById("copyWalletBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyWallet);
  }
}

document.addEventListener("DOMContentLoaded", init);
