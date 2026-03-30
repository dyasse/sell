async function loadQuran() {
  const container = document.getElementById("quranContainer");

  try {
    const response = await fetch("https://api.quran.com/api/v4/chapters?language=ar");
    const data = await response.json();
    const chapters = data.chapters;

    container.innerHTML = "";

    chapters.forEach(surah => {
      const card = document.createElement("div");
      card.className = "service-card";
      card.onclick = () => window.location.href = `details.html?id=${surah.id}`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span class="ayah-number-circle" style="margin: 0; width: 30px; height: 30px; font-size: 14px;">${surah.id}</span>
          <span style="font-size: 12px; color: var(--primary-color); background: rgba(31,111,80,0.1); padding: 4px 10px; border-radius: 10px;">
            ${surah.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}
          </span>
        </div>
        <h3 style="margin: 10px 0; font-family: 'Amiri'; font-size: 24px;">${surah.name_arabic}</h3>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">عدد الآيات: ${surah.verses_count}</p>
        <span class="card-link" style="color: var(--primary-color); font-weight: bold; font-size: 14px;">
          قراءة السورة <i class="fa-solid fa-arrow-left"></i>
        </span>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    container.innerHTML = "<p style='text-align:center; color:red;'>فشل تحميل الفهرس. تأكد من الاتصال بالإنترنت.</p>";
  }
}

// دالة الوضع الليلي للفهرس
function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuran();
  setupTheme();
});
