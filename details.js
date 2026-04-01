function getParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    id: parseInt(params.get("id"), 10) || 1,
    ayah: params.get("ayah") || null,
  };
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

function createVerseHTML(verse, surahId, surahName) {
  const verseNumber = verse?.verse_key?.split(":")[1];

  if (!verseNumber || !verse?.text_uthmani) {
    return "";
  }

  const safeSurahName = surahName.replace(/'/g, "\\'");

  return `
    <span
      id="ayah-${verseNumber}"
      class="ayah"
      onclick="saveAndTafsir(${surahId}, ${verseNumber}, '${safeSurahName}')"
      title="اضغط لحفظ العلامة وقراءة التفسير"
    >
      ${escapeHtml(verse.text_uthmani)} <span class="ayah-num">${verseNumber}</span>
    </span>
  `;
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

document.addEventListener("DOMContentLoaded", loadSurah);
