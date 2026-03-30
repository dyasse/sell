async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const chapterId = parseInt(params.get("id"));
  const targetAyah = params.get("ayah"); // كنقرأو رقم الآية يلا جاية من "متابعة"
  const detailsCard = document.getElementById("detailsCard");

  if (!chapterId || isNaN(chapterId)) {
    detailsCard.innerHTML = "<p style='text-align:center; padding:50px;'>السورة غير موجودة</p>";
    return;
  }

  detailsCard.innerHTML = `
    <div style="text-align: center; color: #1f6f50; font-weight: bold; padding: 60px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 15px;"></i>
      <p>جاري تحميل آيات الله...</p>
    </div>
  `;

  try {
    const [chaptersRes, versesRes] = await Promise.all([
      fetch("https://api.quran.com/api/v4/chapters?language=ar"),
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`)
    ]);

    const chaptersData = await chaptersRes.json();
    const versesData = await versesRes.json();

    const chapters = chaptersData.chapters;
    const chapter = chapters.find(c => c.id === chapterId);
    const verses = versesData.verses || [];

    // رسم الآيات مع إضافة ID لكل آية باش نقدروا نديرو Scroll
    const versesHtml = verses.map(v => {
      const verseNumber = v.verse_key.split(":")[1];
      return `
        <span class="ayah-container" id="ayah-${verseNumber}" style="display: inline;">
          <span class="ayah-text" onclick="saveBookmark(${chapterId}, ${verseNumber}, '${chapter.name_arabic}')" title="اضغط لحفظ علامة توقف هنا">
            ${v.text_uthmani}
          </span>
          <span class="ayah-number-circle">${verseNumber}</span>
        </span>
      `;
    }).join(" ");

    let bismillahHtml = (chapterId !== 1 && chapterId !== 9) ? `<p class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>` : "";
    const nextChapterId = chapterId < 114 ? chapterId + 1 : null;
    const nextChapter = nextChapterId ? chapters.find(c => c.id === nextChapterId) : null;

    detailsCard.innerHTML = `
      <div class="surah-title-header">
        <h1>سُورَةُ ${chapter.name_arabic.replace('سورة ', '')}</h1>
        ${bismillahHtml}
      </div>
      <div class="quran-reader-text">${versesHtml}</div>
      <div class="audio-box" style="margin-top: 40px; text-align: center; border-top: 1px dashed #e8f5ee; padding-top: 30px;">
        <button id="playAudioBtn" style="background: #1f6f50; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-family: 'Cairo'; font-weight: bold;">
          <i class="fa-solid fa-circle-play"></i> استمع للسورة
        </button>
        <audio id="surahAudio" controls style="display:none; width:100%; margin-top:20px;"></audio>
      </div>
      <div class="navigation-box" style="margin-top: 50px; display: flex; justify-content: center; gap: 15px; border-top: 1px solid #eee; padding-top: 30px;">
        ${nextChapter ? `<button onclick="window.location.href='details.html?id=${nextChapterId}'" class="next-surah-btn">السورة التالية: ${nextChapter.name_arabic} <i class="fa-solid fa-arrow-left"></i></button>` : ''}
        <button onclick="window.location.href='quran.html'" style="background:#f1f5f9; padding:15px 25px; border-radius:15px; cursor:pointer; border:none; font-family:'Cairo'; font-weight:bold;">الفهرس</button>
      </div>
    `;

    document.getElementById("playAudioBtn").addEventListener("click", () => loadAudio(chapterId));

    // السحر هنا: التحرك آلياً للآية المحفوظة
    if (targetAyah) {
      setTimeout(() => {
        const ayahElement = document.getElementById(`ayah-${targetAyah}`);
        if (ayahElement) {
          ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ayahElement.style.backgroundColor = "rgba(245, 158, 11, 0.2)"; // تمييز الآية بلون خفيف
          setTimeout(() => ayahElement.style.backgroundColor = "transparent", 3000);
        }
      }, 500);
    }

  } catch (error) {
    console.error(error);
  }
}

function saveBookmark(chapterId, verseNumber, surahName) {
  const bookmark = { id: chapterId, verse: verseNumber, name: surahName };
  localStorage.setItem('nour_bookmark', JSON.stringify(bookmark));
  
  // إشعار بسيط بدل الـ Alert المزعج
  const toast = document.createElement("div");
  toast.innerHTML = `تم حفظ العلامة: سورة ${surahName} آية ${verseNumber}`;
  toast.style = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#1f6f50; color:white; padding:10px 20px; border-radius:30px; z-index:10000; font-family:Cairo;";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

async function loadAudio(chapterId) {
  try {
    const audio = document.getElementById("surahAudio");
    const playBtn = document.getElementById("playAudioBtn");
    const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/1/${chapterId}`);
    const result = await response.json();
    playBtn.style.display = "none";
    audio.src = result.audio_file.audio_url;
    audio.style.display = "block";
    audio.play();
  } catch (error) { console.error(error); }
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => { loadDetails(); setupTheme(); });
