async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  const response = await fetch("products.json");
  const data = await response.json();

  const item = data.find(entry => entry.id === id);
  const detailsCard = document.getElementById("detailsCard");

  if (!item) {
    detailsCard.innerHTML = "<p>العنصر غير موجود</p>";
    return;
  }

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const isFavorite = favorites.includes(item.id);

  let count = 0;

  detailsCard.innerHTML = `
    <h2>${item.title}</h2>
    <p><strong>${item.subtitle}</strong></p>
    <p class="content-text">${item.content}</p>

    <div class="counter-box">
      <p>العدد: <span id="counter">${count}</span></p>
      <button id="increaseBtn">اضغط للتسبيح</button>
      <button id="resetBtn">إعادة</button>
    </div>

    <button id="favoriteBtn">
      ${isFavorite ? "موجود في المفضلة" : "إضافة إلى المفضلة"}
    </button>
  `;

  const counterEl = document.getElementById("counter");

  document.getElementById("increaseBtn").addEventListener("click", () => {
    count++;
    counterEl.textContent = count;
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    count = 0;
    counterEl.textContent = count;
  });

  document.getElementById("favoriteBtn").addEventListener("click", () => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(item.id)) {
      favorites.push(item.id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      alert("تمت الإضافة إلى المفضلة");
    } else {
      alert("هذا العنصر موجود بالفعل في المفضلة");
    }
  });
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

loadDetails();
setupTheme();
