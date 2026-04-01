function checkBookmark() {
  const section = document.getElementById("bookmarkSection");
  const title = document.getElementById("bookmarkTitle");
  const link = document.getElementById("resumeLink");

  if (!section || !title || !link) return;

  const savedData = localStorage.getItem("nour_bookmark");
  if (!savedData) return;

  try {
    const bookmark = JSON.parse(savedData);

    if (!bookmark || !bookmark.id || !bookmark.verse || !bookmark.name) {
      localStorage.removeItem("nour_bookmark");
      return;
    }

    section.style.display = "block";
    title.textContent = `سورة ${bookmark.name} - آية ${bookmark.verse}`;

    link.onclick = function (e) {
      e.preventDefault();
      window.location.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;
    };
  } catch (error) {
    console.error("Invalid bookmark data:", error);
    localStorage.removeItem("nour_bookmark");
  }
}

document.addEventListener("DOMContentLoaded", checkBookmark);
