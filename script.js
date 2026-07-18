function checkBookmark() {
  const section = document.getElementById("bookmarkSection");
  const title = document.getElementById("bookmarkTitle");
  const link = document.getElementById("resumeLink");

  if (!section || !title || !link) return;

  const savedData = localStorage.getItem("nour_bookmark");
  if (!savedData) return;

  try {
    const bookmark = JSON.parse(savedData);

    if (!bookmark || !bookmark.id || !bookmark.verse || !bookmark.name) {
      localStorage.removeItem("nour_bookmark");
      return;
    }

    // عرض البلوك
    section.style.display = "block";

    // النص
    title.textContent = `سورة ${bookmark.name} - آية ${bookmark.verse}`;

    // الرابط (أفضل من onclick)
    link.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;

  } catch (error) {
    console.error("Invalid bookmark data:", error);
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
    drawer.removeAttribute("inert");
    drawer.classList.add("show");
    backdrop.classList.add("show");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.setAttribute("aria-hidden", "false");
    closeBtn?.focus();
  };

  const closeDrawer = () => {
    drawer.classList.remove("show");
    backdrop.classList.remove("show");
    openBtn.focus();
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
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


document.addEventListener("DOMContentLoaded", () => {
  checkBookmark();
  initShareButton();
  initInstallPrompt();
  initSettingsDrawer();
  registerServiceWorker();
});
