const SUPABASE_URL = "https://oqebxioqmcjlhkwqwktk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZWJ4aW9xbWNqbGhrd3F3a3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjkyMzUsImV4cCI6MjA5NDI0NTIzNX0.8F8qtO9solmaVf-lzyygLM-O9Ff9-LYuDf5O1Xf6wSA";

if (!window.supabase?.createClient) {
  throw new Error("Supabase client library is not loaded. Add @supabase/supabase-js v2 before support.js.");
}

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================
// 👤 USER BAR
// ==========================
function setupUserBar() {
  const userBar = document.getElementById("supportUserBar");
  const userText = document.getElementById("supportUserText");

  if (!userBar || !userText) return;

  supabaseClient.auth.onAuthStateChange((event, session) => {
    const user = session?.user;

    if (user) {
      userBar.classList.add("show");

      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "مستخدم";
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
    alert("لا يوجد عنوان للمحفظة");
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
