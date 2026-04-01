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
                <span class="quran-text" id="ayah-${num}" onclick="saveAndTafsir(${id}, ${num}, '${chapter.name_arabic}')">
                    ${v.text_uthmani} <span class="ayah-num">${num}</span>
                </span>
            `;
        }).join("");

        const bismillah = (id !== 1 && id !== 9) ? '<div class="bismillah-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : '';
        
        const nextBtn = id < 114 ? `
            <div style="text-align: center; margin-top: 40px;">
                <button onclick="location.href='details.html?id=${id+1}'" class="next-s-btn">
                    السورة التالية <i class="fa-solid fa-chevron-left"></i>
                </button>
            </div>` : '';

        container.innerHTML = bismillah + `<div class="verses-grid-text">${versesHtml}</div>` + nextBtn;

        if (targetAyah) {
            setTimeout(() => {
                const el = document.getElementById(`ayah-${targetAyah}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add("highlight-ayah");
                }
            }, 600);
        }

    } catch (e) {
        container.innerHTML = "<p style='text-align:center;'>خطأ في التحميل.</p>";
    }
}

function saveAndTafsir(id, verse, name) {
    localStorage.setItem("nour_bookmark", JSON.stringify({ id, verse, name }));
    
    const modal = document.getElementById("tafsirModal");
    document.getElementById("tTitle").innerText = `تفسير سورة ${name} - آية ${verse}`;
    document.getElementById("tBody").innerText = "جاري جلب التفسير...";
    
    // إظهار النافذة فوق كولشي
    modal.style.display = "flex";

    fetch(`https://api.alquran.cloud/v1/ayah/${id}:${verse}/ar.muyassar`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("tBody").innerText = data.data.text;
        })
        .catch(() => {
            document.getElementById("tBody").innerText = "تعذر تحميل التفسير حالياً.";
        });
}

function closeTafsir() {
    document.getElementById("tafsirModal").style.display = "none";
}

// غلق النافذة عند الضغط خارج المربع الأبيض
window.onclick = function(event) {
    const modal = document.getElementById("tafsirModal");
    if (event.target == modal) modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", loadSurah);
