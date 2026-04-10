if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("تم تشغيل Service Worker بنجاح!"))
      .catch((err) => console.log("حدثت مشكلة في Service Worker", err));
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

function escapeHtml(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTypeLabel(type) {
  switch (type) {
    case "dua":
      return "دعاء";
    case "zekr":
      return "ذِكر";
    case "ayah":
      return "آية";
    default:
      return "عنصر محفوظ";
  }
}

function getOpenLink(item) {
  if (item.type === "ayah" && item.id) {
    if (item.verse) {
      return `details.html?id=${item.id}&ayah=${item.verse}`;
    }
    return `details.html?id=${item.id}`;
  }

  return null;
}

function removeFavorite(index) {
  const favorites = getFavorites();
  if (index < 0 || index >= favorites.length) return;

  favorites.splice(index, 1);
  saveFavorites(favorites);
  loadFavorites();
}

function loadFavorites() {
  const favorites = getFavorites();
  const favoritesList = document.getElementById("favoritesList");
  const emptyMessage = document.getElementById("emptyMessage");

  if (!favoritesList || !emptyMessage) return;

  if (!favorites.length) {
    favoritesList.innerHTML = "";
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  favoritesList.innerHTML = favorites
    .map((item, index) => {
      const typeLabel = getTypeLabel(item.type);
      const openLink = getOpenLink(item);

      return `
        <div class="favorite-card">
          <div class="favorite-type">${escapeHtml(typeLabel)}</div>

          ${
            item.title
              ? `<div class="favorite-title">${escapeHtml(item.title)}</div>`
              : ""
          }

          <div class="favorite-text">${escapeHtml(item.text || "")}</div>

          ${
            item.description
              ? `<div class="zekr-desc">${escapeHtml(item.description)}</div>`
              : ""
          }

          ${
            item.repeat
              ? `<div class="dua-source">عدد التكرار: ${escapeHtml(String(item.repeat))}</div>`
              : ""
          }

          <div class="favorite-actions">
            ${
              openLink
                ? `<a href="${openLink}" class="nav-btn">فتح</a>`
                : ""
            }

            <button class="secondary-btn" onclick="removeFavorite(${index})">
              حذف من المفضلة
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", loadFavorites);
