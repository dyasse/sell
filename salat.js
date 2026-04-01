function checkBookmark() {
    const savedData = localStorage.getItem("nour_bookmark");
    const section = document.getElementById("bookmarkSection");
    const title = document.getElementById("bookmarkTitle");
    const link = document.getElementById("resumeLink");

    if (savedData) {
        const bookmark = JSON.parse(savedData);
        section.style.display = "block";
        title.innerText = `سورة ${bookmark.name} - آية ${bookmark.verse}`;
        
        link.onclick = function() {
            window.location.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;
        };
    }
}

document.addEventListener("DOMContentLoaded", checkBookmark);
