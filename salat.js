function checkBookmark() {
  const savedData = localStorage.getItem("nour_bookmark");

  const section = document.getElementById("bookmarkSection");
  const title = document.getElementById("bookmarkTitle");
  const link = document.getElementById("resumeLink");

  if (!section || !title || !link) return;

  if (!savedData) return;

  try {
    const bookmark = JSON.parse(savedData);

    if (!bookmark || !bookmark.id || !bookmark.verse) return;

    section.style.display = "block";
    title.textContent = `سورة ${bookmark.name} - آية ${bookmark.verse}`;

    link.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;
  } catch (error) {
    console.error("Bookmark error:", error);
  }
}

document.addEventListener("DOMContentLoaded", checkBookmark);
