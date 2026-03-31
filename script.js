// دالة لجلب آية اليوم (عشوائية)
async function fetchDailyAyah() {
  try {
    const randomAyah = Math.floor(Math.random() * 6236) + 1;
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.uthmani`);
    const data = await response.json();

    if (data.code === 200) {
      document.getElementById("dailyAyahText").textContent = data.data.text;
      document.getElementById("dailyAyahRef").textContent = `${data.data.surah.name} - آية ${data.data.numberInSurah}`;
    }
  } catch (error) {
    document.getElementById("dailyAyahText").textContent = "اللهم صل على محمد وعلى آل محمد";
  }
}

// دالة فحص علامة القراءة (Bookmark)
function checkBookmark() {
  const bookmark = JSON.parse(localStorage.getItem('nour_bookmark'));
  const card = document.getElementById('bookmarkCard');
  const text = document.getElementById('bookmarkText');
  const btn = document.getElementById('resumeBtn');

  if (bookmark && card) {
    card.style.display = 'block';
    text.innerHTML = `آخر ما قرأت: <strong>سورة ${bookmark.name}</strong> (آية ${bookmark.verse})`;
    
    btn.onclick = () => {
      // كنمشيو للصفحة مع رقم الآية كـ Parameter
      window.location.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;
    };
  }
}

function goToQuran() { window.location.href = "quran.html"; }
function goToAdhkar(type) { window.location.href = `adhkar.html?type=${type}`; }

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchDailyAyah();
  checkBookmark(); // تشغيل فحص العلامة
  setupTheme();
});
// --- وظيفة مشاركة التطبيق ---
function shareApp() {
  if (navigator.share) {
    navigator.share({
      title: 'تطبيق نور 🌙',
      text: 'أنصحك بتجربة تطبيق نور للقرآن الكريم والأذكار ومواقيت الصلاة. تطبيق رائع وبدون إعلانات!',
      url: window.location.origin // كياخد رابط الموقع ديالك فين ما كان
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.origin);
    alert("تم نسخ رابط التطبيق! شاركه مع أصدقائك.");
  }
}

// --- وظائف نافذة التسجيل ---
function openLoginModal() {
  document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}

// إغلاق النافذة عند الضغط خارجها
window.onclick = function(event) {
  const loginModal = document.getElementById("loginModal");
  if (event.target == loginModal) {
    loginModal.style.display = "none";
  }
}
