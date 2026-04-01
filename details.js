function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: parseInt(params.get("id"), 10) || 1,
    ayah: params.get("ayah") || null,
  };
}

function createVerseHTML(verse, surahId, surahName) {
  const verseNumber = verse.verse_key.split(":")[1];

  return `
    <span
      id="ayah-${verseNumber}"
      class="ayah"
      onclick="saveAndTafsir(${surahId}, ${verseNumber}, '${surahName.replace(/'/g, "\\'")}')"
      title="اضغط لحفظ العلامة وقراءة التفسير"
      style="
        cursor:pointer;
        line-height:2.4;
        font-size:30px;
        display:inline;
        margin:0 4px;
      "
    >
      ${verse.text_uthmani} ۝${verseNumber}
    </span>
  `;
}

async function loadSurah() {
  const { id, ayah } = getParams();
  const container = document.getElementById("quranArea");
  const title = document.getElementById("surahTitle");

  if (!container || !title) return;

  try {
    container.innerHTML = "جاري تحميل كلام الله...";

    const [chapRes, versRes] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`),
    ]);

    if (!chapRes.ok || !versRes.ok) {
      throw new Error("Failed to fetch surah data");
    }

    const chapData = await chapRes.json();
    const versData = await versRes.json();

    const chapter = chapData.chapter;
    const verses = Array.isArray(versData.verses) ? versData.verses : [];

    title.textContent = `سورة ${chapter.name_arabic}`;

    const showBismillah = id !== 1 && id !== 9;

    const versesHtml = verses
      .map((v) => createVerseHTML(v, id, chapter.name_arabic))
      .join("");

    container.innerHTML = `
      ${showBismillah ? `
        <div style="text-align:center;font-size:32px;font-weight:700;margin-bottom:24px;color:#0f172a;">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      ` : ""}

      <div style="background:#fff;padding:22px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.06);">
        <div style="font-size:30px;line-height:2.5;text-align:center;color:#111827;">
          ${versesHtml}
        </div>
      </div>

      <div style="margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        ${id > 1 ? `<a href="details.html?id=${id - 1}" class="nav-btn">السورة السابقة</a>` : ""}
        ${id < 114 ? `<a href="details.html?id=${id + 1}" class="nav-btn">السورة التالية</a>` : ""}
      </div>
    `;

    if (ayah) {
      setTimeout(() => {
        const target = document.getElementById(`ayah-${ayah}`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.style.background = "#fef3c7";
          target.style.borderRadius = "8px";
          target.style.padding = "4px 8px";
        }
      }, 500);
    }
  } catch (error) {
    console.error("Error loading surah:", error);
    container.innerHTML = "وقع خطأ أثناء تحميل السورة. حاول مرة أخرى.";
  }
}

function saveAndTafsir(id, verse, name) {
  localStorage.setItem(
    "nour_bookmark",
    JSON.stringify({ id, verse, name })
  );

  const modal = document.getElementById("tafsirModal");
  const title = document.getElementById("tTitle");
  const body = document.getElementById("tBody");

  if (!modal || !title || !body) return;

  title.textContent = `تفسير سورة ${name} - آية ${verse}`;
  body.textContent = "جاري جلب التفسير...";
  modal.style.display = "flex";

  fetch(`https://api.alquran.cloud/v1/ayah/${id}:${verse}/ar.muyassar`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed tafsir fetch");
      return res.json();
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
  if (modal) modal.style.display = "none";
}

window.addEventListener("click", function (event) {
  const modal = document.getElementById("tafsirModal");
  if (modal && event.target === modal) {
    modal.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", loadSurah);
