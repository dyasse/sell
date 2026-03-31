/**
 * دالة جلب بيانات السورة وعرضها بالخط العثماني
 */
async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const chapterId = params.get("id");
  const detailsCard = document.getElementById("detailsCard");

  if (!chapterId) return;

  try {
    // جلب بيانات السورة والآيات (الرسم العثماني)
    const [chapRes, versRes] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/chapters/${chapterId}?language=ar`),
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`)
    ]);

    const chapData = await chapRes.json();
    const versData = await versRes.json();

    const chapter = chapData.chapter;
    const verses = versData.verses;

    // بناء النص القرآني
    const versesHtml = verses.map(v => {
      const num = v.verse_key.split(":")[1];
      return `
        <span class="ayah-container" onclick="showTafsir(${chapterId}, ${num}, '${chapter.name_arabic}')">
          <span class="quran-text">${v.text_uthmani}</span>
          <span class="ayah-number-circle">${num}</span>
        </span>
      `;
    }).join(" ");

    const bismillah = (chapterId != 1 && chapterId != 9) ? '<p style="font-family:Amiri; font-size:32px; margin:30px 0; color:var(--primary);">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>' : '';

    detailsCard.innerHTML = `
      <div class="surah-header" style="text-align:center; margin-bottom:40px;">
        <h1 style="font-family:Amiri; font-size:50px; color:var(--primary); margin:0;">سُورَةُ ${chapter.name_arabic}</h1>
        <p style="opacity:0.7;">${chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} | ${chapter.verses_count} آية</p>
        ${bismillah}
      </div>

      <div class="quran-container">
        <div style="text-align: center;">${versesHtml}</div>
      </div>

      <div style="text-align:center; margin-top:40px; display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
        <button onclick="loadAudio(${chapterId})" class="pay-now-btn" id="playBtn" style="padding: 15px 30px;">
          <i class="fa-solid fa-play"></i> استمع للسورة
        </button>
        <audio id="surahAudio" style="display:none; width:100%; max-width:500px; margin:20px auto;" controls></audio>
      </div>

      <div style="display:flex; justify-content:center; gap:20px; margin-top:30px;">
         <button onclick="window.location.href='quran.html'" class="soft-btn"><i class="fa-solid fa-list"></i> الفهرس</button>
         ${chapterId < 114 ? `<button onclick="window.location.href='details.html?id=${parseInt(chapterId)+1}'" class="soft-btn">السورة التالية <i class="fa-solid fa-arrow-left"></i></button>` : ''}
      </div>
    `;

  } catch (error) {
    detailsCard.innerHTML = "<p style='text-align:center; padding:50px;'>عذراً، حدث خطأ في تحميل السورة.</p>";
  }
}

/**
 * عرض التفسير الميسر وحفظ موضع القراءة
 */
async function showTafsir(cid, vnum, sname) {
  const modal = document.getElementById("tafsirModal");
  const tText = document.getElementById("tafsirText");
  const tTitle = document.getElementById("tafsirTitle");

  tTitle.textContent = `تفسير سورة ${sname} - آية ${vnum}`;
  tText.innerHTML = '<p style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> جاري جلب التفسير...</p>';
  modal.style.display = "flex";

  // حفظ العلامة (Bookmark)
  localStorage.setItem('nour_bookmark', JSON.stringify({id: cid, verse: vnum, name: sname}));

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${cid}:${vnum}/ar.muyassar`);
    const data = await res.json();
    tText.innerHTML = `<p style="text-align:justify; padding:10px;">${data.data.text}</p>
                       <p style="font-size:12px; color:var(--primary); margin-top:15px;">✅ تم حفظ موضع القراءة تلقائياً</p>`;
  } catch (e) { tText.textContent = "تعذر تحميل التفسير حالياً."; }
}

function closeTafsir() { document.getElementById("tafsirModal").style.display = "none"; }

/**
 * تحميل الملف الصوتي للسورة
 */
async function loadAudio(id) {
  const audio = document.getElementById("surahAudio");
  const btn = document.getElementById("playBtn");
  try {
    const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/1/${id}`);
    const data = await res.json();
    audio.src = data.audio_file.audio_url;
    audio.style.display = "block";
    btn.style.display = "none";
    audio.play();
  } catch (e) { alert("تعذر تشغيل الصوت حالياً."); }
}

window.onclick = function(event) {
  const modal = document.getElementById("tafsirModal");
  if (event.target == modal) modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", loadDetails);
