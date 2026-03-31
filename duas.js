const quranDuas = [
  { text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", source: "سورة البقرة" },
  { text: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا", source: "سورة البقرة" },
  { text: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ", source: "سورة إبراهيم" },
  { text: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", source: "سورة الأنبياء" },
  { text: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", source: "سورة طه" },
  { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا", source: "حديث نبوي" },
  { text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", source: "حديث نبوي" },
  { text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", source: "دعاء ليلة القدر" }
];

function renderDuas() {
  const container = document.getElementById("duasContainer");
  container.innerHTML = "";

  quranDuas.forEach((dua) => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.style = "text-align: right; cursor: default; margin-bottom: 20px; border-right: 5px solid #ef4444;";
    
    card.innerHTML = `
      <p style="font-family:'Amiri'; font-size: 24px; line-height: 1.8; margin-bottom: 15px;">${dua.text}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 14px; color: #ef4444; font-weight: bold;">[ ${dua.source} ]</span>
        <button onclick="shareDua('${dua.text}')" style="background: none; border: 1px solid #ddd; padding: 5px 12px; border-radius: 10px; cursor: pointer; font-family:'Cairo'; font-size: 12px;">
          <i class="fa-solid fa-share-nodes"></i> مشاركة
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function shareDua(text) {
  if (navigator.share) {
    navigator.share({
      title: 'دعاء من تطبيق نور',
      text: `${text}\n\nتمت المشاركة من تطبيق نور 🌙`,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text);
    alert("تم نسخ الدعاء بنجاح!");
  }
}

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
  renderDuas();
  setupTheme();
});
