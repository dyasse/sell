async function loadChapters() {
  const quranList = document.getElementById("quranList");
  const searchInput = document.getElementById("searchInput");

  quranList.innerHTML = "<p>جاري تحميل السور...</p>";

  try {
    const response = await fetch("https://api.quran.com/api/v4/chapters?language=ar");
    const result = await response.json();
    const chapters = result.chapters || [];

    function render(items) {
      quranList.innerHTML = "";

      items.forEach(chapter => {
        const revelationText =
          chapter.revelation_place === "makkah" ? "مكية" : "مدنية";

        const card = document.createElement("div");
        card.className = "card surah-card premium-surah-card";

        card.innerHTML = `
          <div class="surah-card-top">
            <div class="surah-number-box">${chapter.id}</div>

            <div class="surah-main-info">
              <h3 class="surah-name-ar">${chapter.name_arabic}</h3>
              <p class="surah-name-en">${chapter.name_simple}</p>
            </div>

            <div class="surah-type-badge">${revelationText}</div>
          </div>

          <div class="surah-meta">
            <div class="meta-item">
              <span class="meta-label">عدد الآيات</span>
              <strong>${chapter.verses_count}</strong>
            </div>

            <div class="meta-item">
              <span class="meta-label">الترتيب</span>
              <strong>${chapter.id}</strong>
            </div>
          </div>

          <div class="surah-card-actions">
            <button onclick="goToDetails(${chapter.id})">قراءة السورة</button>
          </div>
        `;

        quranList.appendChild(card);
      });
    }

    render(chapters);

    searchInput.addEventListener("input", e => {
      const value = e.target.value.trim().toLowerCase();

      const filtered = chapters.filter(chapter =>
        chapter.name_arabic.includes(value) ||
        chapter.name_simple.toLowerCase().includes(value)
      );

      render(filtered);
    });
  } catch (error) {
    quranList.innerHTML = "<p>وقع مشكل فتحميل السور</p>";
    console.error(error);
  }
}

function goToDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

function goHome() {
  window.location.href = "index.html";
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) {
      themeToggle.textContent = "☀️ الوضع النهاري";
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");

      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ الوضع النهاري";
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 الوضع الليلي";
      }
    });
  }
}

loadChapters();
setupTheme();
