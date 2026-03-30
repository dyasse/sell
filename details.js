async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const chapterId = parseInt(params.get("id"));
  const targetAyah = params.get("ayah");
  const detailsCard = document.getElementById("detailsCard");

  if (!chapterId || isNaN(chapterId)) {
    detailsCard.innerHTML = "<p style='text-align:center; padding:50px;'>السورة غير موجودة</p>";
    return;
  }

  detailsCard.innerHTML = `
    <div style="text-align: center; color: #1f6f50; font-weight: bold; padding: 60px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 15px;"></i>
      <p>جاري تحميل السورة والتفسير...</p>
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

    const versesHtml = verses.map(v => {
      const verseNumber = v.verse_key.split(":")[1];
      return `
        <span class="ayah-container" id="ayah-${verseNumber}" style="display: inline; transition: background 1s;">
          <span class="ayah-text" onclick="showTafsir(${chapterId}, ${verseNumber}, '${chapter.name_arabic}')" style="cursor:pointer;" title="اضغط للتفسير وحفظ العلامة">
            ${v.text_uthmani}
          </span>
          <span class="ayah-number-circle">${verseNumber}</span>
        </span>
      `;
    }).join(" ");

    let bismillahHtml = (chapterId !== 1 && chapterId !== 9) ? `<p class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>` : "";
    const nextChapterId = chapterId < 114 ? chapterId + 1 : null;

    detailsCard.innerHTML = `
      <div class="surah-title-header">
        <h1>سُورَةُ ${chapter.name_arabic.replace('سورة ', '')}</h1>
        ${bismillahHtml}
      </div>
      <div class="quran-reader-text">${versesHtml}</div>
      <div id="tafsirModal" class="tafsir-modal">
        <div class="tafsir-content">
          <span class="close-tafsir" onclick="closeTafsir()">&times;</span>
          <h3 id="tafsirTitle">تفسير الآية</h3>
          <p id="tafsirText">جاري تحميل التفسير...</p>
          <div style="font-size:12px; color:#1f6f50; margin-top:10px;">تم حفظ هذه الآية كعلامة توقف تلقائياً ✅</div>
        </div>
      </div>
      <div class="audio-box" style="margin-top: 40px; text-align: center; border-top: 1px dashed #e8f5ee; padding-top: 30px;">
        <button id="playAudioBtn" style="background: #1f6f50; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-family: 'Cairo'; font-weight: bold;">
          <i class="fa-solid fa-circle-play"></i> استمع للسورة
        </button>
        <audio id="surahAudio" controls style="display:none; width:100%; margin-top:20px;"></audio>
      </div>
      <div class="navigation-box" style="margin-top: 50px; display: flex; justify-content: center; gap: 15px; border-top: 1px solid #eee; padding-top: 30px;">
        ${nextChapterId ? `<button onclick="window.location.href='details.html?id=${nextChapterId}'" class="next-surah-btn">السورة التالية <i class="fa-solid fa-arrow-left"></i></button>` : ''}
        <button onclick="window.location.href='quran.html'" style="background:#f1f5f9; padding:15px 25px; border-radius:15px; cursor:pointer; border:none; font-family:'Cairo'; font-weight:bold;">الفهرس</button>
      </div>
    `;

    document.getElementById("playAudioBtn").addEventListener("click", () => loadAudio(chapterId));

    if (targetAyah) {
      setTimeout(() => {
        const ayahElement = document.getElementById(`ayah-${targetAyah}`);
        if (ayahElement) {
          ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ayahElement.style.backgroundColor = "rgba(245, 158, 11, 0.3)";
          setTimeout(() => { ayahElement.style.backgroundColor = "transparent"; }, 3000);
        }
      }, 800);
    }

  } catch (error) { console.error(error); }
}

// دالة جلب التفسير وإظهاره
async function showTafsir(chapterId, verseNumber, surahName) {
  const modal = document.getElementById("tafsirModal");
  const tafsirText = document.getElementById("tafsirText");
  const tafsirTitle = document.getElementById("tafsirTitle");

  tafsirTitle.textContent = `تفسير سورة ${surahName} - آية ${verseNumber}`;
  tafsirText.textContent = "جاري جلب التفسير من الميسر...";
  modal.style.display = "block";

  // حفظ العلامة تلقائياً عند طلب التفسير
  const bookmark = { id: chapterId, verse: verseNumber, name: surahName };
  localStorage.setItem('nour_bookmark', JSON.stringify(bookmark));

  try {
    // استعمال API التفسير (تفسير الميسر)
    const res = await fetch(`https://api.quran.com/api/v4/tafsirs/169/by_ayah/${chapterId}:${verseNumber}`);
    const data = await res.json();
    tafsirText.innerHTML = data.tafsir.text;
  } catch (error) {
    tafsirText.textContent = "تعذر تحميل التفسير حالياً. تأكد من اتصالك بالأنترنت.";
  }
}

function closeTafsir() {
  document.getElementById("tafsirModal").style.display = "none";
}

// إغلاق النافذة عند الضغط خارجها
window.onclick = function(event) {
  const modal = document.getElementById("tafsirModal");
  if (event.target == modal) { modal.style.display = "none"; }
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
