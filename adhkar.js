function getType() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "sabah";
  return ["sabah", "masa"].includes(type) ? type : "sabah";
}

function setActiveCategory(type) {
  const buttons = document.querySelectorAll(".cat-btn");

  buttons.forEach((btn) => {
    const btnType = new URL(btn.href, window.location.origin).searchParams.get("type");
    btn.classList.toggle("active", btnType === type);
  });
}

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
  const section = window.currentAdhkarSection;
  if (!section || !section.items || !section.items[index]) return;

  const item = section.items[index];
  const favorites = getFavorites();
  const exists = favorites.some((fav) => fav.text === item.text);

  let updated = [];

  if (exists) {
    updated = favorites.filter((fav) => fav.text !== item.text);
  } else {
    updated = [
      ...favorites,
      {
        type: "zekr",
        title: section.title,
        text: item.text,
        repeat: item.repeat || 1
      }
    ];
  }

  saveFavorites(updated);
  renderAdhkar(section);
}

function countDown(index) {
  const badge = document.getElementById(`count-${index}`);
  const card = document.getElementById(`zekr-${index}`);

  if (!badge || !card) return;

  let current = parseInt(badge.dataset.count || badge.textContent, 10) || 0;

  if (current > 0) {
    current -= 1;
    badge.dataset.count = current;

    if (current === 0) {
      badge.textContent = "✓";
      card.classList.add("done");
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      badge.textContent = current;
    }
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

function renderAdhkar(section) {
  const container = document.getElementById("adhkarList");
  const titleEl = document.getElementById("adhkarTitle");

  if (!container) return;

  if (!section || !Array.isArray(section.items) || !section.items.length) {
    container.className = "status-box";
    container.innerHTML = "لا توجد أذكار متاحة في هذا القسم حالياً.";
    return;
  }

  window.currentAdhkarSection = section;

  if (titleEl) {
    titleEl.textContent = section.title;
  }

  container.className = "adhkar-list";
  container.innerHTML = section.items
    .map((item, index) => {
      const count = parseInt(item.repeat, 10) || 1;
      const fav = isFavorite(item.text);

      return `
        <article class="zekr-card" id="zekr-${index}">
          <div class="zekr-header">
            <div class="zekr-title">${escapeHtml(section.title)}</div>
            <div class="count-badge" id="count-${index}" data-count="${count}">${count}</div>
          </div>

          <div class="zekr-text">${escapeHtml(item.text)}</div>

          <div class="zekr-actions">
            <button class="zekr-btn primary" onclick="countDown(${index})">
              تسبيحة مكتملة
            </button>
            <button class="zekr-btn secondary" onclick="toggleFavoriteByIndex(${index})">
              ${fav ? "إزالة من المفضلة" : "حفظ في المفضلة"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadAdhkar() {
  const type = getType();
  const listEl = document.getElementById("adhkarList");

  setActiveCategory(type);

  if (listEl) {
    listEl.className = "status-box";
    listEl.innerHTML = "جاري تحميل الأذكار...";
  }

  try {
    const response = await fetch("adhkar.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const section = data[type];
    renderAdhkar(section);
  } catch (error) {
    console.error("Adhkar load error:", error);

    if (listEl) {
      listEl.className = "status-box";
      listEl.innerHTML = "وقع خطأ أثناء تحميل الأذكار. حاول مرة أخرى.";
    }
  }
}

document.addEventListener("DOMContentLoaded", loadAdhkar);
