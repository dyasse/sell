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

        // بناء الآيات
        const versesHtml = versData.verses.map(v => {
            const num = v.verse_key.split(":")[1];
            return `<span class="ayah-item" onclick="saveAndShowTafsir(${chapterId}, ${num}, '${chapData.chapter.name_arabic}')">
                        ${v.text_uthmani} <span class="ayah-num">${num}</span>
                    </span>`;
        }).join(" ");

        detailsCard.innerHTML = `
            <div style="text-align:center; margin-bottom:30px;">
                <h1 style="font-family:Amiri; font-size:40px; color:var(--primary);">سورة ${chapData.chapter.name_arabic}</h1>
                <p style="opacity:0.6;">إضغط على الآية للتفسير وحفظ العلامة</p>
            </div>
            <div class="quran-container"><div class="quran-text">${versesHtml}</div></div>
        `;
    } catch (e) { console.error(e); }
}

function saveAndShowTafsir(cid, vnum, sname) {
    // ميزة العلامة: حفظ آخر سورة وآية في الـ LocalStorage
    const bookmark = { id: cid, verse: vnum, surah: sname };
    localStorage.setItem("nour_bookmark", JSON.stringify(bookmark));
    
    // إظهار التفسير (مثال سريع)
    showTafsirModal(cid, vnum, sname);
}

async function showTafsirModal(cid, vnum, sname) {
    const modal = document.getElementById("tafsirModal");
    modal.style.display = "flex";
    document.getElementById("tafsirTitle").innerText = `سورة ${sname} - آية ${vnum}`;
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${cid}:${vnum}/ar.muyassar`);
    const data = await res.json();
    document.getElementById("tafsirText").innerText = data.data.text;
}

function closeTafsir() { document.getElementById("tafsirModal").style.display = "none"; }

document.addEventListener("DOMContentLoaded", loadDetails);
