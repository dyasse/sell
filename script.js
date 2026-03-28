async function loadChapters() {
  const quranList = document.getElementById("quranList");
  const adhkarList = document.getElementById("adhkarList");
  const searchInput = document.getElementById("searchInput");

  quranList.innerHTML = "<p>جاري تحميل السور...</p>";
  adhkarList.innerHTML = `
    <div class="card">
      <h3>أذكار الصباح</h3>
      <p>مجموعة أذكار يومية</p>
      <button onclick="goToAdhkar('sabah')">فتح</button>
    </div>
    <div class="card">
      <h3>أذكار المساء</h3>
      <p>مجموعة أذكار يومية</p>
      <button onclick="goToAdhkar('masa')">فتح</button>
    </div>
  `;

  try {
    const response = await fetch("https://api.quran.com/api/v4/chapters?language=ar");
    const result = await response.json();
    const chapters = result.chapters || [];

    function render(items) {
      quranList.innerHTML = "";

      items.forEach(chapter => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${chapter.name_arabic}</h3>
          <p>${chapter.verses_count} آية</p>
          <button onclick="goToDetails(${chapter.id})">فتح السورة</button>
        `;
        quranList.appendChild(card);
      });
    }

    render(chapters);

    searchInput.addEventListener("input", e => {
      const value = e.target.value.trim();
      const filtered = chapters.filter(chapter =>
        chapter.name_arabic.includes(value) ||
        chapter.name_simple.toLowerCase().includes(value.toLowerCase())
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

function goToAdhkar(type) {
  alert(`صفحة ${type} نزيدوها من بعد`);
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) themeToggle.textContent = "☀️ الوضع النهاري";
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
