import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// بدّل هاد config بديالك إلا مازال ما درتيهش هنا
const firebaseConfig = {
  apiKey: "PUT_YOUR_API_KEY_HERE",
  authDomain: "PUT_YOUR_PROJECT.firebaseapp.com",
  projectId: "PUT_YOUR_PROJECT_ID_HERE",
  storageBucket: "PUT_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PUT_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PUT_YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// بدّل هاد الروابط بروابط الحسابات الحقيقية ديالك
const SUPPORT_LINKS = {
  stripe: "https://buy.stripe.com/PUT_YOUR_PAYMENT_LINK",
  paypal: "https://www.paypal.com/donate/?hosted_button_id=PUT_YOUR_BUTTON_ID",
  bmc: "https://buymeacoffee.com/PUT_YOUR_USERNAME"
};

function setSupportLinks() {
  const stripeBtn = document.getElementById("stripeSupportBtn");
  const paypalBtn = document.getElementById("paypalSupportBtn");
  const bmcBtn = document.getElementById("bmcSupportBtn");

  if (stripeBtn) stripeBtn.href = SUPPORT_LINKS.stripe;
  if (paypalBtn) paypalBtn.href = SUPPORT_LINKS.paypal;
  if (bmcBtn) bmcBtn.href = SUPPORT_LINKS.bmc;
}

async function copyWallet() {
  const walletBox = document.getElementById("walletAddress");
  const copyBtn = document.getElementById("copyWalletBtn");
  const text = walletBox ? walletBox.textContent.trim() : "";

  if (!text) {
    alert("ما كاينش عنوان للمحفظة.");
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const tempInput = document.createElement("textarea");
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    }

    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 1500);
    }
  } catch (error) {
    console.error("Copy failed:", error);
    alert("تعذر النسخ حالياً.");
  }
}

function bindEvents() {
  const copyBtn = document.getElementById("copyWalletBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyWallet);
  }
}

function setupUserBar() {
  const userBar = document.getElementById("supportUserBar");
  const userText = document.getElementById("supportUserText");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userBar?.classList.add("show");
      userText.textContent = `أنت مسجل الدخول: ${user.displayName || user.email || "مستخدم"}`;
    } else {
      userBar?.classList.remove("show");
      userText.textContent = "أنت غير مسجل الدخول";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setSupportLinks();
  bindEvents();
  setupUserBar();
});
