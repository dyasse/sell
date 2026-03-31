async function loadDetails() {
    const id = new URLSearchParams(window.location.search).get("id");
    const container = document.getElementById("detailsCard");

    const [chapRes, versRes] = await Promise.all([
        fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
        fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
    ]);
    const cData = await chapRes.json();
    const vData = await versRes.json();

    const vHtml = vData.verses.map(v => {
        const n = v.verse_key.split(":")[1];
        return `<span onclick="saveMark(${id}, ${n}, '${cData.chapter.name_arabic}')" style="cursor:pointer;">
                ${v.text_uthmani} <span class="ayah-num">${n}</span></span>`;
    }).join(" ");

    container.innerHTML = `
        <div style="text-align:center; margin-bottom:30px;"><h1 style="font-family:Amiri; font-size:45px; color:var(--primary);">سورة ${cData.chapter.name_arabic}</h1></div>
        <div class="quran-container"><div class="quran-text" style="font-size:34px; line-height:2.3;">${vHtml}</div></div>
    `;
}

function saveMark(id, v, s) {
    localStorage.setItem("nour_bookmark", JSON.stringify({id, verse: v, surah: s}));
    alert("تم حفظ العلامة تلقائياً ✅");
}
document.addEventListener("DOMContentLoaded", loadDetails);
