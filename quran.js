async function loadQuran() {
  const res = await fetch("https://api.quran.com/api/v4/chapters?language=ar");
  const data = await res.json();
  let html = `<table class="surah-table"><thead><tr><th>#</th><th>السورة</th><th>الآيات</th></tr></thead><tbody>`;
  data.chapters.forEach(s => {
    html += `<tr onclick="location.href='details.html?id=${s.id}'"><td>${s.id}</td><td style="font-family:Amiri; font-size:22px; font-weight:bold;">${s.name_arabic}</td><td>${s.verses_count}</td></tr>`;
  });
  document.getElementById("quranContainer").innerHTML = html + "</tbody></table>";
}
loadQuran();
