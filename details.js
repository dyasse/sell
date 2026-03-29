async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const chapterId = parseInt(params.get("id"));
  const detailsCard = document.getElementById("detailsCard");

  if (!chapterId) {
    detailsCard.innerHTML = "<p>السورة غير موجودة</p>";
    return;
  }

  detailsCard.innerHTML = "<p>جاري تحميل السورة...</p>";

  try {
    const [chaptersRes, versesRes] = await Promise.all([
      fetch("https://api.quran.com/api/v4/chapters?language=ar"),
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`)
    ]);

    const chaptersData = await chaptersRes.json();
    const versesData = await versesRes.json();

    const chapter = chaptersData.chapters.find(c => c.id === chapterId);
    const verses = versesData.verses || [];

    if (!chapter) {
      detailsCard.innerHTML = "<p>السورة غير موجودة</p>";
      return;
    }

    const versesHtml = verses.map(v => `
      <span class="ayah">
        ${v.text_uthmani}
        <span class="ayah-number">﴿${v.verse_key.split(":")[1]}﴾</span>
      </span>
    `).join(" ");

    detailsCard.innerHTML = `
     <h2 class="quran-title">${chapter.name_arabic}</h2>
      <p><strong>${chapter.verses_count} آية</strong></p>
      <div class="surah-text">${versesHtml}</div>

      <div class="audio-box">
        <button id="playAudioBtn">تشغيل صوت السورة</button>
        <audio id="surahAudio" controls style="display:none; width:100%; margin-top:15px;"></audio>
      </div>
    `;

    document.getElementById("playAudioBtn").addEventListener("click", () => {
      loadAudio(chapterId);
    });
  } catch (error) {
    detailsCard.innerHTML = "<p>وقع مشكل فتحميل السورة</p>";
    console.error(error);
  }
}

async function loadAudio(chapterId) {
  try {
    const audio = document.getElementById("surahAudio");
    const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/1/${chapterId}`);
    const result = await response.json();

    const audioFile = result.audio_file;

    if (!audioFile || !audioFile.audio_url) {
      alert("الصوت ما توفرش دابا");
      return;
    }

    audio.src = audioFile.audio_url;
    audio.style.display = "block";
    audio.play();
  } catch (error) {
    console.error(error);
    alert("وقع مشكل فالصوت");
  }
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) themeToggle.textContent = "☀️ الوضع النهاري";
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

loadDetails();
setupTheme();
