async function loadDetails() {
    const id = new URLSearchParams(window.location.search).get("id");
    const container = document.getElementById("detailsCard");

    const [chap, vers] = await Promise.all([
        fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
        fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
    ]);
    const cData = await chap.json();
    const vData = await vers.json();

    const vHtml = vData.verses.map(v => {
        const n = v.verse_key.split(":")[1];
        return `<span onclick="saveAndTafsir(${id}, ${n}, '${cData.chapter.name_arabic}')" style="cursor:pointer;">
                ${v.text_uthmani} <span class="ayah-num">${n}</span></span>`;
    }).join(" ");

    container.innerHTML = `
        <div style="text-align:center; margin-bottom:30px;"><h1 style="font-family:Amiri; font-size:45px; color:var(--primary);">سورة ${cData.chapter.name_arabic}</h1></div>
        <div class="quran-container"><div class="quran-text">${vHtml}</div></div>
    `;
}

function saveAndTafsir(id, v, s) {
    localStorage.setItem("nour_bookmark", JSON.stringify({id, verse: v, surah: s}));
    // هنا ممكن تزيد كود المودال ديال التفسير
    alert("تم حفظ مكان القراءة ✅");
}
document.addEventListener("DOMContentLoaded", loadDetails);
