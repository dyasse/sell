// فتح وإغلاق المودال
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

// ميزة "العلامة" (Bookmark)
function checkBookmark() {
    const bookmark = JSON.parse(localStorage.getItem("nour_bookmark"));
    const resumeCard = document.getElementById("resumeCard");
    
    if (bookmark && resumeCard) {
        resumeCard.style.display = "block";
        document.getElementById("lastSurah").innerText = bookmark.surah;
        document.getElementById("resumeBtn").onclick = () => {
            window.location.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;
        };
    }
}

// الوضع الليلي
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.onclick = () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    };
}
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

document.addEventListener("DOMContentLoaded", checkBookmark);
