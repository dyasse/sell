const SURAH_API_URL = "https://api.quran.com/api/v4/chapters?language=ar";
const AUDIO_BASE_URL = "https://download.quranicaudio.com/quran/fahad_alkandari/";
const AUDIO_RECITER_LABEL = "تلاوة القرآن";

let allChapters = [];
let activeLoadingSurahId = null;

function escapeHtml(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSurahAudioUrl(surahNumber) {
  const id = Number(surahNumber);
  if (!Number.isInteger(id) || id < 1 || id > 114) return "";
  const filename = id.toString().padStart(3, "0") + ".mp3";
  const normalized = `${AUDIO_BASE_URL}${filename}`;
  try {
    const url = new URL(normalized);
    url.protocol = "https:";
    return url.toString();
  } catch (_error) {
    return "";
  }
}

function showSnackbar(message) {
  const root = document.getElementById("snackbarRoot");
  if (!root) return;

  root.textContent = message;
  root.classList.add("show");

  window.clearTimeout(showSnackbar.timerId);
  showSnackbar.timerId = window.setTimeout(() => {
    root.classList.remove("show");
  }, 2800);
}

function setListenButtonLoading(surahId, isLoading) {
  const previousLoading = document.querySelector(".listen-btn.is-loading");
  if (previousLoading && String(previousLoading.dataset.surahId) !== String(surahId)) {
    previousLoading.classList.remove("is-loading");
    previousLoading.disabled = false;
  }

  const target = document.querySelector(`.listen-btn[data-surah-id=\"${surahId}\"]`);
  if (!target) return;

  target.classList.toggle("is-loading", isLoading);
  target.disabled = Boolean(isLoading);
}

function renderChapters(chapters) {
  const container = document.getElementById("quranContainer");
  if (!container) return;

  if (!Array.isArray(chapters) || chapters.length === 0) {
    container.className = "status-box";
    container.innerHTML = "لم يتم العثور على نتائج.";
    return;
  }

  container.className = "surah-list";
  container.innerHTML = chapters
    .map((surah) => {
      const id = surah.number || "";
      const nameArabic = escapeHtml(surah.name || "سورة غير معروفة");
      const nameSimple = escapeHtml(surah.englishName || "");
      const versesCount = surah.numberOfAyahs || 0;

      return `
        <article class="surah-card">
          <div class="surah-row">
            <a class="surah-meta" href="details.html?id=${id}" aria-label="فتح تفاصيل سورة ${nameArabic}">
              <div class="surah-name">${nameArabic}</div>
              <div class="surah-sub">
                ${nameSimple} • عدد الآيات: ${versesCount}
              </div>
            </a>
            <div class="surah-actions">
              <button class="listen-btn" type="button" data-surah-id="${id}" data-surah-name="${nameArabic}" aria-label="الاستماع إلى ${nameArabic}">
                <span class="listen-spinner" aria-hidden="true"></span>
                <i class="fa-solid fa-headphones"></i>
              </button>
              <div class="surah-id">${id}</div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function setupSearch() {
  const input = document.getElementById("surahSearch");
  if (!input) return;

  input.addEventListener("input", function () {
    const value = this.value.trim().toLowerCase();

    if (!value) {
      renderChapters(allChapters);
      return;
    }

    const filtered = allChapters.filter((surah) => {
      const arabicName = (surah.name || "").toLowerCase();
      const simpleName = (surah.englishName || "").toLowerCase();
      const id = String(surah.number || "");

      return (
        arabicName.includes(value) ||
        simpleName.includes(value) ||
        id.includes(value)
      );
    });

    renderChapters(filtered);
  });
}

function setupListenEvents() {
  const container = document.getElementById("quranContainer");
  if (!container) return;

  container.addEventListener("click", (event) => {
    const button = event.target.closest(".listen-btn");
    if (!button) return;

    event.preventDefault();
    const surahId = Number(button.dataset.surahId);
    const surahName = button.dataset.surahName || `سورة ${surahId}`;

    if (!surahId) return;
    if (!window.nourAudioPlayer?.setTrack) {
      showSnackbar("مشغل الصوت غير متاح حالياً. أعد تحميل الصفحة.");
      return;
    }

    const audioUrl = buildSurahAudioUrl(surahId);
    if (!audioUrl) {
      showSnackbar("تعذر إنشاء رابط الصوت لهذه السورة.");
      return;
    }

    activeLoadingSurahId = surahId;
    setListenButtonLoading(surahId, true);

    const audioEl = document.getElementById("globalAudioElement");

    const clearLoading = () => {
      if (activeLoadingSurahId !== surahId) return;
      setListenButtonLoading(surahId, false);
      activeLoadingSurahId = null;
      if (audioEl) {
        audioEl.removeEventListener("canplay", onAudioReady);
        audioEl.removeEventListener("playing", onAudioReady);
        audioEl.removeEventListener("error", onAudioError);
      }
      window.removeEventListener("nour:audio-error", onAudioErrorEvent);
    };

    const onAudioReady = () => {
      clearLoading();
    };

    const onAudioError = () => {
      clearLoading();
      const errorInfo = window.nourAudioPlayer?.getLastError?.();
      if (errorInfo) {
        console.error("Quran audio playback failed", {
          surahId,
          audioUrl,
          ...errorInfo
        });
      }
    };

    const onAudioErrorEvent = (event) => {
      if (activeLoadingSurahId !== surahId) return;
      const errorInfo = event?.detail || null;
      if (errorInfo) {
        console.error("Quran audio player event error", {
          surahId,
          audioUrl,
          ...errorInfo
        });
      }
      clearLoading();
    };

    if (audioEl) {
      audioEl.addEventListener("canplay", onAudioReady, { once: true });
      audioEl.addEventListener("playing", onAudioReady, { once: true });
      audioEl.addEventListener("error", onAudioError, { once: true });
      window.addEventListener("nour:audio-error", onAudioErrorEvent, { once: true });
    } else {
      // Fallback for rare cases where player is not initialized yet.
      window.setTimeout(clearLoading, 800);
    }

    window.nourAudioPlayer.setTrack({
      title: `${surahName} - ${AUDIO_RECITER_LABEL}`,
      url: audioUrl,
      autoplay: true
    });

    window.setTimeout(() => {
      if (activeLoadingSurahId === surahId) {
        clearLoading();
      }
    }, 10000);
  });
}

async function loadQuran() {
  const container = document.getElementById("quranContainer");
  if (!container) return;

  container.className = "status-box";
  container.innerHTML = "جاري تحميل فهرس السور...";

  try {
    const response = await fetch(SURAH_API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    allChapters = Array.isArray(data?.chapters)
      ? data.chapters.map((chapter) => ({
          number: chapter?.id,
          name: chapter?.name_arabic,
          englishName: chapter?.name_simple,
          numberOfAyahs: chapter?.verses_count
        }))
      : [];

    renderChapters(allChapters);
    setupSearch();
    setupListenEvents();
  } catch (error) {
    console.error("Failed to load chapters:", error);
    container.className = "status-box";
    container.innerHTML = "تعذر تحميل فهرس السور حالياً. حاول مرة أخرى.";
  }
}

document.addEventListener("DOMContentLoaded", loadQuran);
