async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const chapterId = params.get("id");
  const detailsCard = document.getElementById("detailsCard");

  try {
    // جلب البيانات: السورة + النص العثماني
    const [chapRes, versRes] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/chapters/${chapterId}?language=ar`),
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`)
    ]);

    const chapData = await chapRes.json();
    const versData = await versRes.json();

    const chapter = chapData.chapter;
    const verses = versData.verses;

    // بناء النص القرآني بالخط العثماني مع أرقام الآيات
    const versesHtml = verses.map(v => {
      const num = v.verse_key.split(":")[1];
      return `<span class="ayah" onclick="showTafsir(${chapterId}, ${num}, '${chapter.name_arabic}')" style="cursor:pointer">
                ${v.text_uthmani} <span class="ayah-num">${num}</span>
              </span>`;
    }).join(" ");

    const bismillah = (chapterId != 1 && chapterId != 9) ? '<p style="font-family:Amiri; font-size:30px; margin:20px 0;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>' : '';

    detailsCard.innerHTML = `
      <div class="surah-header" style="text-align:center; margin-bottom:30px;">
        <h1 style="font-family:Amiri; font-size:45px; color:var(--primary); margin:0;">سُورَةُ ${chapter.name_arabic}</h1>
        <p style="opacity:0.7;">${chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} | آياتها ${chapter.verses_count}</p>
        ${bismillah}
      </div>

      <div class="quran-container">
        <div class="quran-text">${versesHtml}</div>
      </div>

      <div style="text-align:center; margin-top:30px; display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
        <button onclick="loadAudio(${chapterId})" class="action-btn" id="playBtn">
          <i class="fa-solid fa-play"></i> استمع للسورة
        </button>
        <a href="quran.html" class="action-btn btn-outline"><i class="fa-solid fa-list"></i> الفهرس</a>
        ${chapterId < 114 ? `<a href="details.html?id=${parseInt(chapterId)+1}" class="action-btn">السورة التالية <i class="fa-solid fa-arrow-left"></i></a>` : ''}
      </div>
      <audio id="surahAudio" style="display:none; width:100%; margin-top:20px;" controls></audio>
    `;

  } catch (error) {
    detailsCard.innerHTML = "<p>حدث خطأ أثناء تحميل السورة.</p>";
  }
}

// دالة التفسير الميسر وحفظ العلامة
async function showTafsir(cid, vnum, sname) {
  const modal = document.getElementById("tafsirModal");
  const tText = document.getElementById("tafsirText");
  const tTitle = document.getElementById("tafsirTitle");

  tTitle.textContent = `تفسير سورة ${sname} - آية ${vnum}`;
  tText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري جلب التفسير...';
  modal.style.display = "flex";

  // حفظ العلامة تلقائياً
  localStorage.setItem('nour_bookmark', JSON.stringify({id: cid, verse: vnum, name: sname}));

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${cid}:${vnum}/ar.muyassar`);
    const data = await res.json();
    tText.innerHTML = `<p style="font-size:20px; line-height:1.8;">${data.data.text}</p>
                       <p style="font-size:12px; color:var(--primary); border-top:1px solid #eee; pt-10;">✅ تم حفظ مكان القراءة</p>`;
  } catch (e) { tText.textContent = "عذراً، فشل تحميل التفسير."; }
}

function closeTafsir() { document.getElementById("tafsirModal").style.display = "none"; }

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
  } catch (e) { alert("فشل تحميل الملف الصوتي"); }
}

document.addEventListener("DOMContentLoaded", () => { 
    loadDetails(); 
    // setupTheme logic
});
