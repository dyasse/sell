async function loadSurah() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id")) || 1;
    const targetAyah = params.get("ayah");
    const container = document.getElementById("quranArea");

    try {
        const [chapRes, versRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
        ]);

        const chapData = await chapRes.json();
        const versData = await versRes.json();
        const chapter = chapData.chapter;

        document.getElementById("surahTitle").innerText = "سورة " + chapter.name_arabic;

        const versesHtml = versData.verses.map(v => {
            const num = v.verse_key.split(":")[1];
            return `
                <span class="quran-text" id="ayah-${num}" onclick="saveAndTafsir(${id}, ${num}, '${chapter.name_arabic}')" style="cursor:pointer;">
                    ${v.text_uthmani} <span class="ayah-num">${num}</span>
                </span>
            `;
        }).join("");

        const bismillah = (id !== 1 && id !== 9) ? '<div style="font-family:Amiri; font-size:32px; text-align:center; margin-bottom:20px; color:var(--primary);">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : '';
        
        const nextBtn = id < 114 ? `<div style="text-align:center; margin-top:30px;"><button onclick="location.href='details.html?id=${id+1}'" style="background:var(--primary); color:white; border:none; padding:15px 30px; border-radius:15px; font-family:Cairo; font-weight:bold; cursor:pointer;">السورة التالية <i class="fa-solid fa-chevron-left"></i></button></div>` : '';

        container.innerHTML = bismillah + versesHtml + nextBtn;

        if (targetAyah) {
            setTimeout(() => {
                const el = document.getElementById(`ayah-${targetAyah}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    } catch (e) { container.innerHTML = "خطأ في التحميل"; }
}

function saveAndTafsir(id, verse, name) {
    localStorage.setItem("nour_bookmark", JSON.stringify({ id, verse, name }));
    // هنا تفتح المودال ديال التفسير (نفس كود التفسير اللي عطيتك قبل)
    alert(`تم حفظ العلامة: سورة ${name} آية ${verse}`);
}

document.addEventListener("DOMContentLoaded", loadSurah);
