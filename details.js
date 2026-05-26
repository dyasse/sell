const runtimeEnv = typeof window !== "undefined" ? window.NOUR_ENV || {} : {};
const QURAN_AUDIO_BASE_URL = runtimeEnv.QURAN_AUDIO_BASE_URL || "https://download.quranicaudio.com/quran/fahad_alkandari/";
const DEFAULT_RECITER_ID = runtimeEnv.QURAN_RECITER_ID || "fahad_alkandari";
let quranSyncInstance = null;

function getParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    id: parseInt(params.get("id"), 10) || 1,
    ayah: params.get("ayah") || null,
  };
}

function buildSurahAudioUrl(surahNumber) {
  const id = Number(surahNumber);
  if (!Number.isInteger(id) || id < 1 || id > 114) return "";
  const filename = id.toString().padStart(3, "0") + ".mp3";
  const normalized = `${QURAN_AUDIO_BASE_URL}${filename}`;
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

function setPlayButtonLoading(isLoading) {
  const button = document.getElementById("playSurahBtn");
  if (!button) return;
  button.classList.toggle("is-loading", Boolean(isLoading));
  button.disabled = Boolean(isLoading);
}

function setupSurahAudioButton({ id, surahName }) {
  const button = document.getElementById("playSurahBtn");
  if (!button) return;

  button.dataset.surahId = String(id);
  button.dataset.surahName = surahName || `سورة ${id}`;

  if (button.dataset.bound === "1") return;
  button.dataset.bound = "1";

  button.addEventListener("click", async () => {
    const surahId = Number(button.dataset.surahId);
    const name = button.dataset.surahName || `سورة ${surahId}`;

    if (!surahId) return;
    if (!window.nourAudioPlayer?.setTrack) {
      showSnackbar("مشغل الصوت غير متاح حالياً. أعد تحميل الصفحة.");
      return;
    }

    const audioUrl = buildSurahAudioUrl(surahId);
    if (!audioUrl) {
      showSnackbar("تعذر إنشاء رابط MP3 لهذه السورة.");
      return;
    }

    const playerState = window.nourAudioPlayer.getState?.();
    const normalizedCurrent = (playerState?.audioUrl || "").replace(/\?.*$/, "");
    const normalizedTarget = audioUrl.replace(/\?.*$/, "");
    const globalAudio = document.getElementById("globalAudioElement");

    if (normalizedCurrent && normalizedCurrent === normalizedTarget && globalAudio) {
      try {
        if (globalAudio.paused) {
          await globalAudio.play();
        } else {
          globalAudio.pause();
        }
      } catch (error) {
        console.error("Toggle audio failed", error);
      }
      return;
    }

    setPlayButtonLoading(true);
    const onAudioErrorEvent = (event) => {
      const errorInfo = event?.detail || null;
      showSnackbar(errorInfo?.message || "تعذر تشغيل السورة حالياً. حاول مرة أخرى.");
    };
    window.addEventListener("nour:audio-error", onAudioErrorEvent);

    try {
      await window.nourAudioPlayer.setTrack({
        title: `${name} - فهد الكندري`,
        url: audioUrl,
        autoplay: true
      });
    } catch (error) {
      console.error("Audio playback failed", error);
      showSnackbar("تعذر تشغيل السورة حالياً. حاول مرة أخرى.");
    } finally {
      window.removeEventListener("nour:audio-error", onAudioErrorEvent);
      window.setTimeout(() => {
        setPlayButtonLoading(false);
      }, 1000);
    }
  });
}

function escapeHtml(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getVerseTiming(verse) {
  const startTime = Number(verse?.start_time ?? verse?.startTime ?? verse?.timestamp_from);
  const endTime = Number(verse?.end_time ?? verse?.endTime ?? verse?.timestamp_to);

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return null;
  }

  return { startTime, endTime };
}

function handleAyahClick(e) {
  const ayah = e.target.closest(".ayah[data-surah-id]");
  if (!ayah) return;
  if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
  if (e.type === "keydown") e.preventDefault();
  saveAndTafsir(
    Number(ayah.dataset.surahId),
    Number(ayah.dataset.verseNum),
    ayah.dataset.surahName || ""
  );
}

function createVerseHTML(verse, surahId, surahName) {
  const verseNumber = verse?.verse_key?.split(":")[1];

  if (!verseNumber || !verse?.text_uthmani) {
    return "";
  }

  const timing = getVerseTiming(verse);
  const timingAttrs = timing
    ? `data-start="${timing.startTime}" data-end="${timing.endTime}"`
    : "";

  return `
    <span
      id="ayah-${verseNumber}"
      class="ayah"
      data-sura="sura_${surahId}"
      data-ayah="${verseNumber}"
      data-surah-id="${surahId}"
      data-verse-num="${verseNumber}"
      data-surah-name="${escapeHtml(surahName)}"
      ${timingAttrs}
      role="button"
      tabindex="0"
      title="اضغط لحفظ العلامة وقراءة التفسير"
    >
      ${escapeHtml(verse.text_uthmani)} <span class="ayah-num">${verseNumber}</span>
    </span>
  `;
}

function setupAyahAutoSync({ id, surahName }) {
  const audio = document.getElementById("globalAudioElement");
  if (!audio || !window.NourQuranSync?.initQuranSync) return;

  if (quranSyncInstance?.destroy) {
    quranSyncInstance.destroy();
  }

  quranSyncInstance = window.NourQuranSync.initQuranSync({
    audioEl: audio,
    ayahSelector: ".ayah",
    reciterId: DEFAULT_RECITER_ID,
    suraId: `sura_${id}`,
    title: `سورة ${surahName}`,
    artist: DEFAULT_RECITER_ID,
    album: "Nour Quran"
  });

  window.quranSyncInstance = quranSyncInstance;
}


function renderSurahNavigation(id) {
  return `
    <div class="surah-navigation">
      ${id > 1 ? `<a href="details.html?id=${id - 1}" class="nav-btn">السورة السابقة</a>` : ""}
      ${id < 114 ? `<a href="details.html?id=${id + 1}" class="nav-btn">السورة التالية</a>` : ""}
    </div>
  `;
}

async function loadSurah() {
  const { id, ayah } = getParams();
  const container = document.getElementById("quranArea");
  const title = document.getElementById("surahTitle");

  if (!container || !title) return;

  container.innerHTML = `
    <div class="status-box">
      جاري تحميل كلام الله...
    </div>
  `;

  try {
    const [chapterResponse, versesResponse] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`),
    ]);

    if (!chapterResponse.ok || !versesResponse.ok) {
      throw new Error("Failed to fetch surah data");
    }

    const chapterData = await chapterResponse.json();
    const versesData = await versesResponse.json();

    const chapter = chapterData?.chapter;
    const verses = Array.isArray(versesData?.verses) ? versesData.verses : [];

    if (!chapter || !verses.length) {
      throw new Error("Invalid surah data");
    }

    title.textContent = `سورة ${chapter.name_arabic}`;
    setupSurahAudioButton({
      id,
      surahName: chapter.name_arabic
    });

    const showBismillah = id !== 1 && id !== 9;
    const versesHtml = verses
      .map((verse) => createVerseHTML(verse, id, chapter.name_arabic))
      .join("");

    container.innerHTML = `
      ${
        showBismillah
          ? `
            <div class="text-center" style="font-size: 32px; font-weight: 700; margin-bottom: 24px; color: #1e293b;">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          `
          : ""
      }

      <div class="quran-text text-center">
        ${versesHtml}
      </div>

      ${renderSurahNavigation(id)}
    `;

    container.addEventListener("click", handleAyahClick);
    container.addEventListener("keydown", handleAyahClick);

    setupAyahAutoSync({ id, surahName: chapter.name_arabic });

    if (ayah) {
      setTimeout(() => {
        const target = document.getElementById(`ayah-${ayah}`);

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          target.style.background = "rgba(245, 158, 11, 0.18)";
          target.style.borderRadius = "8px";
          target.style.padding = "4px 8px";
        }
      }, 500);
    }
  } catch (error) {
    console.error("Error loading surah:", error);

    container.innerHTML = `
      <div class="status-box">
        وقع خطأ أثناء تحميل السورة. حاول مرة أخرى.
      </div>
    `;
  }
}

function saveBookmark(id, verse, name) {
  try {
    localStorage.setItem(
      "nour_bookmark",
      JSON.stringify({ id, verse, name })
    );
  } catch (error) {
    console.error("Bookmark save error:", error);
  }
}

function openTafsirModal(name, verse) {
  const modal = document.getElementById("tafsirModal");
  const title = document.getElementById("tTitle");
  const body = document.getElementById("tBody");

  if (!modal || !title || !body) return null;

  title.textContent = `تفسير سورة ${name} - آية ${verse}`;
  body.textContent = "جاري جلب التفسير...";
  modal.style.display = "flex";

  return body;
}

function saveAndTafsir(id, verse, name) {
  saveBookmark(id, verse, name);

  const body = openTafsirModal(name, verse);
  if (!body) return;

  fetch(`https://api.alquran.cloud/v1/ayah/${id}:${verse}/ar.muyassar`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed tafsir fetch");
      }
      return response.json();
    })
    .then((data) => {
      body.textContent = data?.data?.text || "تعذر تحميل التفسير حالياً.";
    })
    .catch((error) => {
      console.error("Tafsir error:", error);
      body.textContent = "تعذر تحميل التفسير حالياً.";
    });
}

function closeTafsir() {
  const modal = document.getElementById("tafsirModal");
  if (modal) {
    modal.style.display = "none";
  }
}

window.addEventListener("click", function (event) {
  const modal = document.getElementById("tafsirModal");

  if (modal && event.target === modal) {
    closeTafsir();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  loadSurah();
  const closeBtn = document.getElementById("tafsirCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeTafsir);
});
