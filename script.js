// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTYiaVkb_PL5pG73v0nhKgwR5TAif_xnc",
  authDomain: "nour-30704.firebaseapp.com",
  projectId: "nour-30704",
  storageBucket: "nour-30704.firebasestorage.app",
  messagingSenderId: "387739904110",
  appId: "1:387739904110:web:33600e65dfb0ed72f91e7f",
  measurementId: "G-8K72MGRLFG"
};

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

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
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
  initInstallPrompt();
  registerServiceWorker();
});
