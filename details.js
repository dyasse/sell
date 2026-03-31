async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const chapterId = params.get("id");
  const detailsCard = document.getElementById("detailsCard");

  try {
    const [chapRes, versRes] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/chapters/${chapterId}?language=ar`),
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`)
    ]);

    const chapData = await chapRes.json();
    const versData = await versRes.json();

    const versesHtml = versData.verses.map(v => {
      const num = v.verse_key.split(":")[1];
      return `<span class="ayah-item">${v.text_uthmani} <span class="ayah-num">${num}</span></span>`;
    }).join(" ");

    detailsCard.innerHTML = `
      <div class="surah-header" style="text-align:center; margin-bottom:30px;">
        <h1 style="font-family:Amiri; font-size:45px; color:var(--primary);">سُورَةُ ${chapData.chapter.name_arabic}</h1>
        <p style="opacity:0.6;">${chapData.chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} | ${chapData.chapter.verses_count} آية</p>
      </div>
      <div class="quran-container">
        <div class="quran-text">${versesHtml}</div>
      </div>
    `;
  } catch (e) { console.error(e); }
}
