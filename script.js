async function loadData() {
  const response = await fetch("products.json");
  const data = await response.json();

  const quranList = document.getElementById("quranList");
  const adhkarList = document.getElementById("adhkarList");
  const searchInput = document.getElementById("searchInput");

  function render(items) {
    quranList.innerHTML = "";
    adhkarList.innerHTML = "";

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.subtitle}</p>
        <button onclick="goToDetails(${item.id})">فتح</button>
      `;

      if (item.category === "quran") {
        quranList.appendChild(card);
      } else {
        adhkarList.appendChild(card);
      }
    });
  }

  render(data);

  searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    const filtered = data.filter(item =>
      item.title.toLowerCase().includes(value)
    );
    render(filtered);
  });
}

function goToDetails(id) {
  window.location.href = `details.html?id=${id}`;
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

loadData();
setupTheme();
