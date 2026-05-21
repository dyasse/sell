const runtimeEnv = typeof window !== "undefined" ? window.NOUR_ENV || {} : {};
const SUPABASE_URL = runtimeEnv.SUPABASE_URL || "{{SUPABASE_URL}}";
const SUPABASE_ANON_KEY = runtimeEnv.SUPABASE_ANON_KEY || "{{SUPABASE_ANON_KEY}}";
const SUPPORT_EMAIL = "support@nour-quran.com";

function hasConfiguredValue(value) {
  return Boolean(value && !value.includes("{{") && !value.includes("REPLACE_"));
}

function disableAuthUi(reason) {
  const openAuthBtn = document.getElementById("openAuthBtn");
  const authModal = document.getElementById("authModal");
  if (openAuthBtn) {
    openAuthBtn.classList.add("hidden");
    openAuthBtn.disabled = true;
    openAuthBtn.setAttribute("aria-hidden", "true");
  }
  if (authModal) authModal.setAttribute("aria-hidden", "true");
  console.warn(reason);
}

const authConfigReady = hasConfiguredValue(SUPABASE_URL) && hasConfiguredValue(SUPABASE_ANON_KEY);
const supabaseRuntimeReady = Boolean(window.supabase?.createClient);
if (!authConfigReady) {
  disableAuthUi("Supabase auth is disabled because SUPABASE_URL or SUPABASE_ANON_KEY is not configured.");
}
if (authConfigReady && !supabaseRuntimeReady) {
  disableAuthUi("Supabase client library is not loaded. Add @supabase/supabase-js v2 before auth.js.");
}

const disabledAuthError = new Error("Supabase auth is disabled.");
const supabaseClient = authConfigReady && supabaseRuntimeReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : {
      auth: {
        signInWithOAuth: async () => ({ error: disabledAuthError }),
        signInWithPassword: async () => ({ error: disabledAuthError }),
        signUp: async () => ({ error: disabledAuthError }),
        resetPasswordForEmail: async () => ({ error: disabledAuthError }),
        signOut: async () => ({ error: disabledAuthError }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } })
      }
    };

// Configure the OAuth redirect URL used for social logins.
// Change `APP_CUSTOM_SCHEME` to match your app's custom scheme registered in AndroidManifest.xml
// Example: 'nour://login' or 'myapp://login'
const APP_CUSTOM_SCHEME = window.NOUR_ENV?.APP_CUSTOM_SCHEME || 'nour://login';
const isNative = !!window.Capacitor;
const OAUTH_REDIRECT_TO = isNative ? APP_CUSTOM_SCHEME : window.location.href;

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
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

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

function openDeleteAccountRequest() {
  const email = emailInput?.value?.trim() || "";
  const subject = encodeURIComponent("Nour Quran account deletion request");
  const body = encodeURIComponent(
    [
      "App: Nour Quran",
      "Package: com.dyasse.nourquran",
      `Account email: ${email || "[enter account email]"}`,
      "",
      "Please delete my Nour Quran account and associated Supabase authentication data.",
      "I understand that legal, fraud-prevention, security, or financial records may be retained where required."
    ].join("\n")
  );
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
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
      redirectTo: OAUTH_REDIRECT_TO
    }
  });

  if (error) throw error;
}

// Handle incoming app URL opens (Capacitor)
async function handleAppUrlOpen(url) {
  if (!url) return;
  try {
    // Try to let the Supabase client parse and store the session from the deep link.
    if (typeof supabaseClient.auth.getSessionFromUrl === 'function') {
      await supabaseClient.auth.getSessionFromUrl({ storeSession: true, url });
      setStatus('تم تسجيل الدخول عبر مزود خارجي.');
      closeAuthModal();
      return;
    }

    // Fallback: attempt to extract `code` and exchange (older/newer SDKs may expose exchangeCodeForSession)
    const parsed = new URL(url);
    const code = parsed.searchParams.get('code');
    if (code && typeof supabaseClient.auth.exchangeCodeForSession === 'function') {
      await supabaseClient.auth.exchangeCodeForSession({ code });
      setStatus('تم تسجيل الدخول عبر مزود خارجي.');
      closeAuthModal();
      return;
    }

    setStatus('لم يتم التعرف على رابط تسجيل الدخول بشكل صحيح.', true);
  } catch (err) {
    setStatus(mapAuthError(err), true);
  }
}

// Register Capacitor appUrlOpen listener when running inside native app
try {
  const AppPlugin = window.Capacitor?.App || window.Capacitor?.Plugins?.App;
  if (AppPlugin && typeof AppPlugin.addListener === 'function') {
    AppPlugin.addListener('appUrlOpen', (event) => {
      // event.url contains the deep link
      const incoming = event?.url || event?.detail?.url;
      handleAppUrlOpen(incoming);
    });
  }
} catch (e) {
  // noop - plugin not available in web
}

loginTabBtn?.addEventListener("click", () => setMode(false));
signupTabBtn?.addEventListener("click", () => setMode(true));
openAuthBtn?.addEventListener("click", showAuthModal);
closeAuthBtn?.addEventListener("click", closeAuthModal);
deleteAccountBtn?.addEventListener("click", openDeleteAccountRequest);

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
