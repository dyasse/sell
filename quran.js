let allChapters = [];

function escapeHtml(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
      const id = surah.id || "";
      const nameArabic = escapeHtml(surah.name_arabic || "سورة غير معروفة");
      const nameSimple = escapeHtml(surah.name_simple || "");
      const versesCount = surah.verses_count || 0;

      return `
        <a class="surah-card" href="details.html?id=${id}">
          <div class="surah-row">
            <div class="surah-meta">
              <div class="surah-name">${nameArabic}</div>
              <div class="surah-sub">
                ${nameSimple} • عدد الآيات: ${versesCount}
              </div>
            </div>
            <div class="surah-id">${id}</div>
          </div>
        </a>
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
      const arabicName = (surah.name_arabic || "").toLowerCase();
      const simpleName = (surah.name_simple || "").toLowerCase();
      const id = String(surah.id || "");

      return (
        arabicName.includes(value) ||
        simpleName.includes(value) ||
        id.includes(value)
      );
    });

    renderChapters(filtered);
  });
}

async function loadQuran() {
  const container = document.getElementById("quranContainer");
  if (!container) return;

  container.className = "status-box";
  container.innerHTML = "جاري تحميل فهرس السور...";

  try {
    const response = await fetch("https://api.quran.com/api/v4/chapters?language=ar");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    allChapters = Array.isArray(data?.chapters) ? data.chapters : [];

    renderChapters(allChapters);
    setupSearch();
  } catch (error) {
    console.error("Failed to load chapters:", error);
    container.className = "status-box";
    container.innerHTML = "تعذر تحميل فهرس السور حالياً. حاول مرة أخرى.";
  }
}

document.addEventListener("DOMContentLoaded", loadQuran);
