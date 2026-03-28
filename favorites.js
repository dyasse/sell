async function loadFavorites() {
  const response = await fetch("products.json");
  const data = await response.json();

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const favoritesList = document.getElementById("favoritesList");
  const emptyMessage = document.getElementById("emptyMessage");

  const favoriteItems = data.filter(item => favorites.includes(item.id));

  if (favoriteItems.length === 0) {
    emptyMessage.style.display = "block";
    favoritesList.innerHTML = "";
    return;
  }

  emptyMessage.style.display = "none";
  favoritesList.innerHTML = "";

  favoriteItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.subtitle}</p>
      <div class="card-actions">
        <button onclick="goToDetails(${item.id})">فتح</button>
        <button onclick="removeFavorite(${item.id})">حذف</button>
      </div>
    `;
    favoritesList.appendChild(card);
  });
}

function goToDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(itemId => itemId !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ الوضع النهاري";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️ الوضع النهاري";
    } else {
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙 الوضع الليلي";
    }
  });
}

loadFavorites();
setupTheme();
