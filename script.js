async function loadDailyAyah() {
  const dailyAyahText = document.getElementById("dailyAyahText");
  const dailyAyahRef = document.getElementById("dailyAyahRef");

  try {
    const day = new Date().getDate();
    const surahNumber = (day % 114) + 1;

    const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNumber}`);
    const result = await response.json();
    const verses = result.verses || [];

    if (verses.length > 0) {
      const firstVerse = verses[0];
      dailyAyahText.textContent = firstVerse.text_uthmani;
      dailyAyahRef.textContent = `سورة رقم ${surahNumber} - الآية 1`;
    } else {
      dailyAyahText.textContent = "تعذر تحميل آية اليوم";
    }
  } catch (error) {
    dailyAyahText.textContent = "وقع مشكل فتحميل آية اليوم";
    console.error(error);
  }
}

function goToQuran() {
  window.location.href = "quran.html";
}

function goToAdhkar(type) {
  window.location.href = `adhkar.html?type=${type}`;
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) {
      themeToggle.textContent = "☀️ الوضع النهاري";
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");

      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ الوضع النهاري";
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 الوضع الليلي";
      }
    });
  }
}

loadDailyAyah();
setupTheme();
