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
    // --- Logic l-Popup dyal l-Support ---
function handleSupportPopup() {
  const popup = document.getElementById("supportPopup");
  const timerBar = document.getElementById("popupTimer");

  // Show after 2 seconds
  setTimeout(() => {
    if (popup) {
      popup.style.display = "block";
      if (timerBar) timerBar.style.width = "0%"; // Start shrinking
      
      // Auto-hide after 20 seconds
      setTimeout(() => {
        closeSupportPopup();
      }, 20000);
    }
  }, 2000);
}

function closeSupportPopup() {
  const popup = document.getElementById("supportPopup");
  if (popup) popup.style.opacity = "0";
  setTimeout(() => { if(popup) popup.style.display = "none"; }, 500);
}

// --- Daily Ayah & Bookmark (Existing logic m-adapty) ---
async function fetchDailyAyah() {
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${Math.floor(Math.random() * 6236) + 1}/ar.uthmani`);
    const data = await res.json();
    document.getElementById("dailyAyahText").textContent = data.data.text;
    document.getElementById("dailyAyahRef").textContent = data.data.surah.name;
  } catch (e) { console.log(e); }
}

function checkBookmark() {
  const bookmark = JSON.parse(localStorage.getItem('nour_bookmark'));
  if (bookmark) {
    document.getElementById('bookmarkCard').style.display = 'block';
    document.getElementById('bookmarkText').textContent = bookmark.name;
    document.getElementById('resumeBtn').onclick = () => {
      window.location.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;
    };
  }
}

// Start everything
document.addEventListener("DOMContentLoaded", () => {
  fetchDailyAyah();
  checkBookmark();
  handleSupportPopup(); // Launch popup
  // setupTheme() etc...
});
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
// --- Logic l-Popup dyal l-Support ---
function handleSupportPopup() {
  const popup = document.getElementById("supportPopup");
  const timerBar = document.getElementById("popupTimer");

  // Show after 2 seconds
  setTimeout(() => {
    if (popup) {
      popup.style.display = "block";
      if (timerBar) timerBar.style.width = "0%"; // Start shrinking
      
      // Auto-hide after 20 seconds
      setTimeout(() => {
        closeSupportPopup();
      }, 20000);
    }
  }, 2000);
}

function closeSupportPopup() {
  const popup = document.getElementById("supportPopup");
  if (popup) popup.style.opacity = "0";
  setTimeout(() => { if(popup) popup.style.display = "none"; }, 500);
}

// --- Daily Ayah & Bookmark (Existing logic m-adapty) ---
async function fetchDailyAyah() {
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${Math.floor(Math.random() * 6236) + 1}/ar.uthmani`);
    const data = await res.json();
    document.getElementById("dailyAyahText").textContent = data.data.text;
    document.getElementById("dailyAyahRef").textContent = data.data.surah.name;
  } catch (e) { console.log(e); }
}

function checkBookmark() {
  const bookmark = JSON.parse(localStorage.getItem('nour_bookmark'));
  if (bookmark) {
    document.getElementById('bookmarkCard').style.display = 'block';
    document.getElementById('bookmarkText').textContent = bookmark.name;
    document.getElementById('resumeBtn').onclick = () => {
      window.location.href = `details.html?id=${bookmark.id}&ayah=${bookmark.verse}`;
    };
  }
}

// Start everything
document.addEventListener("DOMContentLoaded", () => {
  fetchDailyAyah();
  checkBookmark();
  handleSupportPopup(); // Launch popup
  // setupTheme() etc...
});
// --- Modal Login ---
function openLoginModal() {
  document.getElementById("loginModal").style.display = "flex";
}
function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}

// --- Support Popup (20s) ---
function handleSupportPopup() {
  const popup = document.getElementById("supportPopup");
  const timerBar = document.getElementById("popupTimer");
  setTimeout(() => {
    if (popup) {
      popup.style.display = "block";
      if (timerBar) timerBar.style.width = "0%";
      setTimeout(() => { closeSupportPopup(); }, 20000);
    }
  }, 3000);
}
function closeSupportPopup() {
  const popup = document.getElementById("supportPopup");
  if (popup) {
    popup.style.opacity = "0";
    setTimeout(() => popup.style.display = "none", 500);
  }
}

// --- General Functions ---
function shareApp() {
  if (navigator.share) {
    navigator.share({ title: 'تطبيق نور', url: window.location.href });
  }
}

window.onclick = function(event) {
  const loginModal = document.getElementById("loginModal");
  if (event.target == loginModal) loginModal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  // Existing: fetchDailyAyah(), checkBookmark()...
  handleSupportPopup();
});
