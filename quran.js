if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker خدام بنجاح!'))
      .catch(err => console.log('وقع مشكل في الـ Service Worker', err));
  });
}
async function loadChapters() {
  const quranList = document.getElementById("quranList");
  const searchInput = document.getElementById("searchInput");

  quranList.innerHTML = "<p style='text-align:center; color:#1f6f50; grid-column: 1 / -1; font-weight: bold;'>جاري تحميل السور...</p>";

  try {
    const response = await fetch("https://api.quran.com/api/v4/chapters?language=ar");
    const result = await response.json();
    const chapters = result.chapters || [];

    function render(items) {
      quranList.innerHTML = "";

      // يلا مالقاش السورة فالبحث
      if (items.length === 0) {
        quranList.innerHTML = "<p style='text-align:center; color:#6b7d76; grid-column: 1 / -1;'>لم يتم العثور على سورة بهذا الاسم.</p>";
        return;
      }

      items.forEach(chapter => {
        const revelationText = chapter.revelation_place === "makkah" ? "مكية" : "مدنية";

        const card = document.createElement("div");
        // حيدنا كلاس card القديم وخلينا غير الكلاسات الجداد ديال الديزاين
        card.className = "surah-card";
        
        // خلي الكارطة كاملة كليكابل (مزيانة للتليفون)
        card.onclick = () => goToDetails(chapter.id);

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
              <span class="meta-label">آياتها</span>
              <strong>${chapter.verses_count}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">ترتيبها</span>
              <strong>${chapter.id}</strong>
            </div>
          </div>

          <div class="surah-card-actions">
            <button onclick="event.stopPropagation(); goToDetails(${chapter.id})">قراءة السورة</button>
          </div>
        `;

        quranList.appendChild(card);
      });
    }

    render(chapters);

    if (searchInput) {
      searchInput.addEventListener("input", e => {
        const value = e.target.value.trim().toLowerCase();
        const filtered = chapters.filter(chapter =>
          chapter.name_arabic.includes(value) ||
          chapter.name_simple.toLowerCase().includes(value)
        );
        render(filtered);
      });
    }

  } catch (error) {
    quranList.innerHTML = "<p style='text-align:center; color:#e74c3c; grid-column: 1 / -1;'>وقع مشكل في تحميل السور. تأكد من اتصالك بالأنترنت.</p>";
    console.error(error);
  }
}

function goToDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  // هنا غنبدلو غير الأيقونة عوض النص كامل باش يبقى الديزاين زوين
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");

      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      }
    });
  }
}

// تأكد بلي الكود ما يخدم حتى تترشارجا الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadChapters();
  setupTheme();
});
