async function loadDetails() {
  const id = new URLSearchParams(window.location.search).get("id");
  const [chap, vers] = await Promise.all([
    fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
    fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
  ]);
  const cData = await chap.json();
  const vData = await vers.json();
  const vHtml = vData.verses.map(v => `${v.text_uthmani} <span style="font-family:Cairo; font-size:16px; border:1px solid var(--primary); border-radius:50%; padding:2px 8px;">${v.verse_key.split(":")[1]}</span>`).join(" ");
  document.getElementById("detailsCard").innerHTML = `
    <div style="text-align:center; margin-bottom:30px;"><h1 style="font-family:Amiri; font-size:40px; color:var(--primary);">سورة ${cData.chapter.name_arabic}</h1></div>
    <div class="quran-container"><div class="quran-text">${vHtml}</div></div>
  `;
}
loadDetails();
