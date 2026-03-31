function checkBookmark() {
    const mark = JSON.parse(localStorage.getItem("nour_bookmark"));
    const card = document.getElementById("resumeCard");
    if (mark && card) {
        card.style.display = "block";
        document.getElementById("lastSurah").innerText = mark.surah;
        document.getElementById("resumeBtn").onclick = () => {
            location.href = `details.html?id=${mark.id}`;
        };
    }
}

// الوضع الليلي
document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

document.addEventListener("DOMContentLoaded", checkBookmark);
