/**
 * دالة جلب السور وعرضها في جدول منظم
 */
async function loadQuran() {
  const container = document.getElementById("quranContainer");

  try {
    // جلب قائمة السور من API القرآن الكريم (v4)
    const response = await fetch("https://api.quran.com/api/v4/chapters?language=ar");
    const data = await response.json();
    const chapters = data.chapters;

    // بناء هيكل الجدول
    let tableHtml = `
      <table class="surah-table">
        <thead>
          <tr>
            <th>#</th>
            <th>السورة</th>
            <th>النوع</th>
            <th>الآيات</th>
          </tr>
        </thead>
        <tbody>
    `;

    // ملء الجدول بالبيانات
    chapters.forEach(surah => {
      const isMakkah = surah.revelation_place === 'makkah';
      
      tableHtml += `
        <tr onclick="window.location.href='details.html?id=${surah.id}'">
          <td>${surah.id}</td>
          <td class="surah-name-cell">${surah.name_arabic}</td>
          <td>
            <span class="badge ${isMakkah ? 'makkah' : 'madinah'}">
              ${isMakkah ? 'مكية' : 'مدنية'}
            </span>
          </td>
          <td>${surah.verses_count}</td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    
    // وضع الجدول في الحاوية
    container.innerHTML = tableHtml;

  } catch (error) {
    console.error("خطأ في تحميل الفهرس:", error);
    container.innerHTML = `
      <div style="text-align:center; padding: 30px; color: #ef4444;">
        <i class="fa-solid fa-circle-exclamation fa-2x"></i>
        <p>عذراً، فشل تحميل الفهرس. تأكد من اتصالك بالإنترنت.</p>
        <button onclick="loadQuran()" class="pay-now-btn" style="margin-top:10px;">إعادة المحاولة</button>
      </div>
    `;
  }
}

/**
 * إعداد الوضع الليلي والسمات
 */
function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
      localStorage.setItem("theme", currentTheme);
    });
  }
}

// تشغيل الدوال عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadQuran();
  setupTheme();
});
