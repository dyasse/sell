const SUPABASE_URL = "https://oqebxioqmcjlhkwqwktk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZWJ4aW9xbWNqbGhrd3F3a3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjkyMzUsImV4cCI6MjA5NDI0NTIzNX0.8F8qtO9solmaVf-lzyygLM-O9Ff9-LYuDf5O1Xf6wSA";

if (!window.supabase?.createClient) {
  throw new Error("Supabase client library is not loaded. Add @supabase/supabase-js v2 before auth.js.");
}

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

let isSignupMode = false;
let isBusy = false;

function mapAuthError(error) {
  const message = error?.message || "";
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login") || normalized.includes("invalid credentials")) {
    return "الإيميل أو كلمة السر غير صحيحة.";
  }

  if (normalized.includes("email") && normalized.includes("invalid")) {
    return "الإيميل غير صالح.";
  }

  if (normalized.includes("password") && normalized.includes("6")) {
    return "كلمة المرور ضعيفة. يجب أن تتكون من 6 أحرف على الأقل.";
  }

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "هذا البريد الإلكتروني مستخدم مسبقًا.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "هناك عدد كبير من المحاولات. حاول لاحقًا.";
  }

  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "توجد مشكلة في الاتصال بالإنترنت.";
  }

  return message || "وقع خطأ غير متوقع.";
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

async function signInWithProvider(provider) {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.href
    }
  });

  if (error) throw error;
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
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: creds.email,
      password: creds.password
    });

    if (error) throw error;

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
    const { error } = await supabaseClient.auth.signUp({
      email: creds.email,
      password: creds.password
    });

    if (error) throw error;

    setStatus("تم إنشاء الحساب. تحقق من بريدك الإلكتروني إذا كان التفعيل مطلوبًا ثم سجّل الدخول.");
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
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.href
    });

    if (error) throw error;

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
    await signInWithProvider("google");
    setStatus("جارٍ تحويلك لتسجيل الدخول عبر Google.");
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
    await signInWithProvider("facebook");
    setStatus("جارٍ تحويلك لتسجيل الدخول عبر Facebook.");
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
    const { error } = await supabaseClient.auth.signOut();

    if (error) throw error;

    setStatus("تم تسجيل الخروج.");
  } catch (error) {
    setStatus(mapAuthError(error), true);
  } finally {
    setBusy(false);
  }
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  const user = session?.user;

  if (user) {
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
    setStatus(`مرحبا ${name}`);
    logoutBtn?.classList.remove("hidden");
    closeAuthModal();
  } else {
    setStatus(event === "SIGNED_OUT" ? "تم تسجيل الخروج." : "مرحبا بك في نور");
    logoutBtn?.classList.add("hidden");
  }
});
