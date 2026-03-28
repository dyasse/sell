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

  detailsCard.innerHTML = `
    <h2>${item.title}</h2>
    <p><strong>${item.subtitle}</strong></p>
    <p class="content-text">${item.content}</p>
    <button id="favoriteBtn">إضافة إلى المفضلة</button>
  `;

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

loadDetails();
