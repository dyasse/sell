let allChapters = [];

function renderChapters(chapters) {
  const container = document.getElementById("quranContainer");
  if (!container) return;

  if (!chapters.length) {
    container.innerHTML = `<div class="status-box">لم يتم العثور على نتائج.</div>`;
    return;
  }

  container.className = "surah-list";
  container.innerHTML = chapters
    .map(
      (s) => `
        <a class="surah-card" href="details.html?id=${s.id}">
          <div class="surah-row">
            <div class="surah-meta">
              <div class="surah-name">${s.name_arabic}</div>
              <div class="surah-sub">
                ${s.name_simple} • عدد الآيات: ${s.verses_count}
              </div>
            </div>
            <div class="surah-id">${s.id}</div>
          </div>
        </a>
      `
    )
    .join("");
}

function setupSearch() {
  const input = document.getElementById("surahSearch");
  if (!input) return;

  input.addEventListener("input", function () {
    const value = this.value.trim();

    if (!value) {
      renderChapters(allChapters);
      return;
    }

    const filtered = allChapters.filter((s) => {
      return (
        s.name_arabic.includes(value) ||
        s.name_simple.toLowerCase().includes(value.toLowerCase()) ||
        String(s.id).includes(value)
      );
    });

    renderChapters(filtered);
  });
}

async function loadQuran() {
  const container = document.getElementById("quranContainer");
  if (!container) return;

  try {
    const res = await fetch("https://api.quran.com/api/v4/chapters?language=ar");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    allChapters = Array.isArray(data.chapters) ? data.chapters : [];

    renderChapters(allChapters);
    setupSearch();
  } catch (error) {
    console.error("Failed to load chapters:", error);
    container.className = "status-box";
    container.innerHTML = "تعذر تحميل فهرس السور حالياً. حاول مرة أخرى.";
  }
}

document.addEventListener("DOMContentLoaded", loadQuran);
