const TYPE_CONFIG = {
  sabah: {
    title: "أذكار الصباح",
    apiCategory: "أذكار الصباح",
  },
  masa: {
    title: "أذكار المساء",
    apiCategory: "أذكار المساء",
  },
  nawm: {
    title: "أذكار النوم",
    apiCategory: "أذكار النوم",
  },
  shita: {
    title: "أذكار المطر",
    apiCategory: "أذكار المطر",
  },
  khouroj: {
    title: "أذكار الخروج من المنزل",
    apiCategory: "أذكار الخروج من المنزل",
  },
  dokhol: {
    title: "أذكار الدخول إلى المنزل",
    apiCategory: "أذكار الدخول إلى المنزل",
  },
};

function getType() {
  const params = new URLSearchParams(window.location.search);
  return params.get("type") || "sabah";
}

function setActiveCategory(type) {
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });
}

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
  const favorites = getFavorites();
  return favorites.some((item) => item.text === text);
}

function toggleFavorite(item) {
  const favorites = getFavorites();
  const exists = favorites.some((fav) => fav.text === item.text);

  let updated;
  if (exists) {
    updated = favorites.filter((fav) => fav.text !== item.text);
  } else {
    updated = [
      ...favorites,
      {
        type: "zekr",
        title: item.categoryTitle,
        text: item.content,
        description: item.description || "",
      },
    ];
  }

  saveFavorites(updated);
  loadAdhkar();
}

function renderAdhkar(items, categoryTitle) {
  const container = document.getElementById("adhkarList");
  if (!container) return;

  if (!items.length) {
    container.className = "status-box";
    container.innerHTML = "لا توجد أذكار متاحة في هذا القسم حالياً.";
    return;
  }

  container.className = "adhkar-list";
  container.innerHTML = items
    .map((item, index) => {
      const count = parseInt(item.count, 10) || 1;
      const fav = isFavorite(item.content);

      return `
        <div class="zekr-card" id="zekr-${index}">
          <div class="zekr-header">
            <div class="zekr-title">${categoryTitle}</div>
            <div class="count-badge" id="count-${index}">${count}</div>
          </div>

          <div class="zekr-text">${item.content}</div>

          ${
            item.description
              ? `<div class="zekr-desc">${item.description}</div>`
              : ""
          }

          <div class="zekr-actions">
            <button class="zekr-btn primary" onclick="countDown(${index})">
              تسبيحة مكتملة
            </button>
            <button
              class="zekr-btn secondary"
              onclick='toggleFavorite(${JSON.stringify({
                content: item.content,
                description: item.description || "",
                categoryTitle,
              }).replace(/'/g, "&apos;")})'
            >
              ${fav ? "إزالة من المفضلة" : "حفظ في المفضلة"}
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function countDown(index) {
  const badge = document.getElementById(`count-${index}`);
  const card = document.getElementById(`zekr-${index}`);
  if (!badge || !card) return;

  let current = parseInt(badge.textContent, 10) || 0;

  if (current > 0) {
    current -= 1;
    badge.textContent = current;

    if (current === 0) {
      card.classList.add("done");
      badge.textContent = "✓";
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }
}

async function loadAdhkar() {
  const type = getType();
  const titleEl = document.getElementById("adhkarTitle");
  const listEl = document.getElementById("adhkarList");

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.sabah;
  if (titleEl) titleEl.textContent = config.title;
  setActiveCategory(type);

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/nawafalqari/azkar-api/master/azkar.json"
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const list = Array.isArray(data[config.apiCategory])
      ? data[config.apiCategory]
      : [];

    renderAdhkar(list, config.title);
  } catch (e) {
    console.error("Adhkar load error:", e);
    if (listEl) {
      listEl.className = "status-box";
      listEl.innerHTML = "وقع خطأ أثناء تحميل الأذكار. حاول مرة أخرى.";
    }
  }
}

document.addEventListener("DOMContentLoaded", loadAdhkar);
