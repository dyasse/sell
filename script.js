function openLoginModal() { document.getElementById("loginModal").style.display = "flex"; }
function closeLoginModal() { document.getElementById("loginModal").style.display = "none"; }
function shareApp() { navigator.share({ title: 'تطبيق نور', url: window.location.href }); }
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");
