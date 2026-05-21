function checkBookmark() {
  const section = document.getElementById("bookmarkSection");
  const title = document.getElementById("bookmarkTitle");
  const link = document.getElementById("resumeLink");

  if (!section || !title || !link) return;

  const savedData = localStorage.getItem("lastRead") || localStorage.getItem("nour_bookmark");
  if (!savedData) return;

  try {
    const bookmark = JSON.parse(savedData);

    if (!bookmark || !bookmark.id || !bookmark.verse || !bookmark.name) {
      localStorage.removeItem("lastRead");
      localStorage.removeItem("nour_bookmark");
      return;
    }

    section.style.display = "block";
    title.textContent = `سورة ${bookmark.name} - آية ${bookmark.verse}`;
    link.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;
  } catch (error) {
    console.error("Invalid bookmark data:", error);
    localStorage.removeItem("lastRead");
    localStorage.removeItem("nour_bookmark");
  }
}

async function shareApp() {
  const shareData = {
    title: "نور",
    text: "جرّب تطبيق نور للقرآن والأذكار والأدعية",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    if (navigator.clipboard && shareData.url) {
      await navigator.clipboard.writeText(shareData.url);
      alert("تم نسخ رابط التطبيق.");
      return;
    }

    alert("المشاركة غير متوفرة في هذا الجهاز.");
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.error("Share failed:", error);
      alert("تعذر مشاركة التطبيق حاليا.");
    }
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol !== "http:" && window.location.protocol !== "https:") return;

  window.addEventListener("load", () => {
    const swUrl = new URL("sw.js", window.location.href);
    navigator.serviceWorker.register(swUrl, { scope: "./" })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

function initInstallPrompt() {
  const installBtn = document.getElementById("installAppBtn");
  if (!installBtn) return;

  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.classList.remove("hidden");
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      installBtn.classList.add("hidden");
    }
    deferredPrompt = null;
  });

  window.addEventListener("appinstalled", () => {
    installBtn.classList.add("hidden");
    deferredPrompt = null;
  });
}

function initShareButton() {
  const shareBtn = document.getElementById("shareAppBtn");
  if (!shareBtn) return;

  shareBtn.addEventListener("click", shareApp);
}

function initSettingsDrawer() {
  const openBtn = document.getElementById("openSettingsBtn");
  const closeBtn = document.getElementById("closeSettingsBtn");
  const drawer = document.getElementById("settingsDrawer");
  const backdrop = document.getElementById("settingsBackdrop");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const decreaseOffsetBtn = document.getElementById("decreaseOffsetBtn");
  const increaseOffsetBtn = document.getElementById("increaseOffsetBtn");
  const offsetValue = document.getElementById("offsetValue");
  const languageSelector = document.getElementById("languageSelector");

  if (!openBtn || !drawer || !backdrop) return;

  const OFFSET_KEY = "nour_prayer_offset_minutes";
  const THEME_KEY = "nour_theme";

  const openDrawer = () => {
    drawer.classList.add("show");
    backdrop.classList.add("show");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.setAttribute("aria-hidden", "false");
  };

  const closeDrawer = () => {
    drawer.classList.remove("show");
    backdrop.classList.remove("show");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.setAttribute("aria-hidden", "true");
  };

  openBtn.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (darkModeToggle) darkModeToggle.checked = theme === "dark";
  };

  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
  darkModeToggle?.addEventListener("change", (event) => {
    applyTheme(event.target.checked ? "dark" : "light");
  });

  let offset = Number(localStorage.getItem(OFFSET_KEY) || 0);
  const renderOffset = () => {
    if (offsetValue) offsetValue.textContent = `${offset} min`;
    localStorage.setItem(OFFSET_KEY, String(offset));
  };
  renderOffset();

  decreaseOffsetBtn?.addEventListener("click", () => {
    offset -= 1;
    renderOffset();
  });
  increaseOffsetBtn?.addEventListener("click", () => {
    offset += 1;
    renderOffset();
  });

  const savedLanguage = window.NourI18n?.getLanguage?.() || "ar";
  if (languageSelector) languageSelector.value = savedLanguage;
  languageSelector?.addEventListener("change", (event) => {
    const selectedLanguage = event.target.value;
    if (window.NourI18n) {
      window.NourI18n.setLanguage(selectedLanguage);
    } else {
      localStorage.setItem("nour_ui_language", selectedLanguage);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
}


function initCookieConsent() {
  const banner = document.getElementById("cookieConsentBanner");
  const acceptBtn = document.getElementById("acceptCookieConsent");
  if (!banner || !acceptBtn) return;

  const CONSENT_KEY = "nour_cookie_consent_accepted";
  const hasConsent = localStorage.getItem(CONSENT_KEY) === "true";

  if (hasConsent) {
    banner.classList.remove("show");
    banner.setAttribute("aria-hidden", "true");
    return;
  }

  banner.classList.add("show");
  banner.setAttribute("aria-hidden", "false");

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "true");
    banner.classList.remove("show");
    banner.setAttribute("aria-hidden", "true");
  });
}

function initSupportPopup() {
  const popup = document.getElementById("supportPopup");
  const closeBtn = document.getElementById("closeSupportPopupBtn");
  const laterBtn = document.getElementById("supportPopupLaterBtn");
  const donateBtn = document.getElementById("supportPopupDonateBtn");
  if (!popup) return;

  const DISMISS_KEY = "nour_support_popup_dismissed_at";
  const DAY_MS = 24 * 60 * 60 * 1000;

  const lastDismiss = Number(localStorage.getItem(DISMISS_KEY) || 0);
  const shouldShow = !lastDismiss || Date.now() - lastDismiss > DAY_MS;

  const closePopup = () => {
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!shouldShow) return;

  setTimeout(() => {
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
  }, 800);

  closeBtn?.addEventListener("click", closePopup);
  laterBtn?.addEventListener("click", closePopup);
  donateBtn?.addEventListener("click", closePopup);

  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      closePopup();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  checkBookmark();
  initShareButton();
  initSupportPopup();
  initCookieConsent();
  initInstallPrompt();
  initSettingsDrawer();
  registerServiceWorker();
});
