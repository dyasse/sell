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
    const stored = localStorage.getItem("nour_favorites");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Favorites parse error:", error);
    return [];
  }
}

function saveFavorites(items) {
  localStorage.setItem("nour_favorites", JSON.stringify(items));
}

function isFavorite(text) {
  return getFavorites().some((item) => item.text === text);
}

function toggleFavoriteByIndex(index) {
  const dua = quranDuas[index];
  if (!dua) return;

  const favorites = getFavorites();
  const exists = favorites.some((item) => item.text === dua.text);

  const updated = exists
    ? favorites.filter((item) => item.text !== dua.text)
    : [
        ...favorites,
        {
          type: "dua",
          title: dua.source,
          text: dua.text,
        },
      ];

  saveFavorites(updated);
  renderDuas();
}

async function shareDuaByIndex(index) {
  const dua = quranDuas[index];
  if (!dua) return;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "دعاء من تطبيق نور",
        text: dua.text,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(dua.text);
      alert("تم نسخ الدعاء.");
    } else {
      alert("المشاركة غير متوفرة في هذا الجهاز.");
    }
  } catch (error) {
    console.error("Share error:", error);
  }
}

function escapeHtml(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderDuas() {
  const container = document.getElementById("duasContainer");
  if (!container) return;

  if (!quranDuas.length) {
    container.className = "status-box";
    container.innerHTML = "لا توجد أدعية متاحة حالياً.";
    return;
  }

  container.className = "duas-list";
  container.innerHTML = quranDuas
    .map((dua, index) => {
      const fav = isFavorite(dua.text);

      return `
        <div class="dua-card">
          <div class="dua-text">${escapeHtml(dua.text)}</div>
          <div class="dua-source">${escapeHtml(dua.source)}</div>

          <div class="dua-actions">
            <button
              class="dua-btn primary"
              onclick="toggleFavoriteByIndex(${index})"
            >
              ${fav ? "إزالة من المفضلة" : "حفظ في المفضلة"}
            </button>

            <button
              class="dua-btn secondary"
              onclick="shareDuaByIndex(${index})"
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
