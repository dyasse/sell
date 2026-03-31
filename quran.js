async function loadQuran() {
  const container = document.getElementById("quranContainer");
  container.innerHTML = '<div style="text-align:center; padding:50px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>جاري تحميل الفهرس...</p></div>';

  try {
    const response = await fetch("https://api.quran.com/api/v4/chapters?language=ar");
    const data = await response.json();
    
    let tableHtml = `
      <div class="table-container">
        <table class="surah-table">
          <thead>
            <tr>
              <th>#</th>
              <th>السورة</th>
              <th>النوع</th>
              <th>الآيات</th>
              <th>قراءة</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.chapters.forEach(surah => {
      const isMakkah = surah.revelation_place === 'makkah';
      tableHtml += `
        <tr onclick="window.location.href='details.html?id=${surah.id}'">
          <td>${surah.id}</td>
          <td class="surah-name-cell">${surah.name_arabic}</td>
          <td><span class="badge ${isMakkah ? 'makkah' : 'madinah'}">${isMakkah ? 'مكية' : 'مدنية'}</span></td>
          <td>${surah.verses_count}</td>
          <td><i class="fa-solid fa-book-open" style="color:var(--primary)"></i></td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table></div>`;
    container.innerHTML = tableHtml;

  } catch (error) {
    container.innerHTML = "<p style='text-align:center; color:red;'>تعذر تحميل الفهرس.</p>";
  }
}

// دالة الوضع الليلي
function setupTheme() {
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}

document.addEventListener("DOMContentLoaded", () => { loadQuran(); setupTheme(); });
