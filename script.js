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
        <button>فتح</button>
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

loadData();