async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const chapterId = parseInt(params.get("id"));
  const detailsCard = document.getElementById("detailsCard");

  if (!chapterId || isNaN(chapterId)) {
    detailsCard.innerHTML = "<p style='text-align:center; padding:50px;'>السورة غير موجودة</p>";
    return;
  }

  // أنيميشن التحميل
  detailsCard.innerHTML = `
    <div style="text-align: center; color: #1f6f50; font-weight: bold; padding: 60px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 15px;"></i>
      <p>جاري تحميل آيات الله...</p>
    </div>
  `;

  try {
    // جلب البيانات: معلومات السور + الآيات
    const [chaptersRes, versesRes] = await Promise.all([
      fetch("https://api.quran.com/api/v4/chapters?language=ar"),
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`)
    ]);

    const chaptersData = await chaptersRes.json();
    const versesData = await versesRes.json();

    const chapters = chaptersData.chapters;
    const chapter = chapters.find(c => c.id === chapterId);
    const verses = versesData.verses || [];

    if (!chapter) {
      detailsCard.innerHTML = "<p style='text-align:center;'>السورة غير موجودة</p>";
      return;
    }

    // تنسيق الآيات
    const versesHtml = verses.map(v => `
      <span class="ayah-text">${v.text_uthmani}</span>
      <span class="ayah-number-circle">${v.verse_key.split(":")[1]}</span>
    `).join(" ");

    // إضافة البسملة (من غير الفاتحة والتوبة)
    let bismillahHtml = "";
    if (chapterId !== 1 && chapterId !== 9) {
      bismillahHtml = `<p class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>`;
    }

    // تحديد السورة التالية
    const nextChapterId = chapterId < 114 ? chapterId + 1 : null;
    const nextChapter = nextChapterId ? chapters.find(c => c.id === nextChapterId) : null;

    detailsCard.innerHTML = `
      <div class="surah-title-header">
        <h1>سُورَةُ ${chapter.name_arabic.replace('سورة ', '')}</h1>
        ${bismillahHtml}
      </div>

      <div class="quran-reader-text">
        ${versesHtml}
      </div>

      <div class="audio-box" style="margin-top: 40px; text-align: center; border-top: 1px dashed #e8f5ee; padding-top: 30px;">
        <button id="playAudioBtn" style="background: #1f6f50; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-family: 'Cairo', sans-serif; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.3s; display: inline-flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-play" style="font-size: 20px;"></i> استمع للسورة
        </button>
        <audio id="surahAudio" controls style="display:none; width:100%; margin-top:20px; border-radius: 30px;"></audio>
      </div>

      <div class="navigation-box" style="margin-top: 50px; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; border-top: 1px solid #eee; padding-top: 30px;">
        
        ${nextChapter ? `
          <button onclick="window.location.href='details.html?id=${nextChapterId}'" class="next-surah-btn">
             السورة التالية: ${nextChapter.name_arabic.replace('سورة ', '')} <i class="fa-solid fa-arrow-left"></i>
          </button>
        ` : ''}

        <button onclick="window.location.href='quran.html'" style="background:#f1f5f9; color:#475569; border:none; padding:15px 25px; border-radius:15px; font-family:'Cairo'; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-list"></i> الفهرس
        </button>
      </div>
    `;

    // تفعيل مشغل الصوت
    const playBtn = document.getElementById("playAudioBtn");
    playBtn.addEventListener("click", () => {
      loadAudio(chapterId);
    });

  } catch (error) {
    detailsCard.innerHTML = "<p style='text-align:center; color:#e74c3c; padding:40px;'>وقع مشكل في تحميل السورة. تأكد من اتصالك بالأنترنت.</p>";
    console.error(error);
  }
}

async function loadAudio(chapterId) {
  try {
    const audio = document.getElementById("surahAudio");
    const playBtn = document.getElementById("playAudioBtn");
    
    playBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...';
    playBtn.style.opacity = "0.7";

    const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/1/${chapterId}`);
    const result = await response.json();
    const audioFile = result.audio_file;

    if (!audioFile || !audioFile.audio_url) {
      alert("الصوت غير متوفر حالياً");
      playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> استمع للسورة';
      playBtn.style.opacity = "1";
      return;
    }

    playBtn.style.display = "none";
    audio.src = audioFile.audio_url;
    audio.style.display = "block";
    audio.play();

    // ميزة إضافية: ملي يسالي الصوت، يدوز لصفحة السورة الموالية بوحدو
    audio.onended = function() {
      const nextId = chapterId + 1;
      if (nextId <= 114) {
        window.location.href = `details.html?id=${nextId}`;
      }
    };

  } catch (error) {
    console.error(error);
    alert("وقع مشكل في تحميل الصوت");
  }
}

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
      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDetails();
  setupTheme();
});
