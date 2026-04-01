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

    // عرض البلوك
    section.style.display = "block";

    // النص
    title.textContent = `سورة ${bookmark.name} - آية ${bookmark.verse}`;

    // الرابط (أفضل من onclick)
    link.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;

  } catch (error) {
    console.error("Invalid bookmark data:", error);
    localStorage.removeItem("nour_bookmark");
  }
}

document.addEventListener("DOMContentLoaded", checkBookmark);
