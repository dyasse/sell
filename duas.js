const quranDuas = [
  {
    text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    source: "سورة البقرة",
  },
  {
    text: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",
    source: "سورة البقرة",
  },
  {
    text: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    source: "سورة إبراهيم",
  },
  {
    text: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    source: "سورة الأنبياء",
  },
  {
    text: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    source: "سورة طه",
  },
  {
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    source: "حديث نبوي",
  },
  {
    text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    source: "حديث نبوي",
  },
  {
    text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    source: "دعاء ليلة القدر",
  },
];

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem("nour_favorites")) || [];
  } catch {
    return [];
  }
}

function saveFavorites(items) {
  localStorage.setItem("nour_favorites", JSON.stringify(items));
}

function isFavorite(text) {
  return getFavorites().some((item) => item.text === text);
}

function toggleFavorite(dua) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.text === dua.text);

  const updated = exists
    ? favorites.filter((item) => item.text !== dua.text)
    : [...favorites, { type: "dua", title: dua.source, text: dua.text }];

  saveFavorites(updated);
  renderDuas();
}

async function shareDua(text) {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "دعاء من تطبيق نور",
        text,
      });
    } else {
      await navigator.clipboard.writeText(text);
      alert("تم نسخ الدعاء.");
    }
  } catch (error) {
    console.error("Share error:", error);
  }
}

function renderDuas() {
  const container = document.getElementById("duasContainer");
  if (!container) return;

  container.innerHTML = quranDuas
    .map((dua) => {
      const fav = isFavorite(dua.text);

      return `
        <div class="dua-card">
          <div class="dua-text">${dua.text}</div>
          <div class="dua-source">${dua.source}</div>

          <div class="dua-actions">
            <button
              class="dua-btn primary"
              onclick='toggleFavorite(${JSON.stringify(dua).replace(/'/g, "&apos;")})'
            >
              ${fav ? "إزالة من المفضلة" : "حفظ في المفضلة"}
            </button>

            <button
              class="dua-btn secondary"
              onclick='shareDua(${JSON.stringify(dua.text).replace(/'/g, "&apos;")})'
            >
              مشاركة / نسخ
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", renderDuas);
