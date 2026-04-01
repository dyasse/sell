async function loadSurah() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const container = document.getElementById("quranDetails");

    if (!id) return;

    try {
        // جلب بيانات السورة والنص العثماني
        const [chapRes, versRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
        ]);

        const chapData = await chapRes.json();
        const versData = await versRes.json();

        const chapter = chapData.chapter;
        document.getElementById("surahName").innerText = "سورة " + chapter.name_arabic;

        // بناء الآيات
        const versesHtml = versData.verses.map(v => {
            const num = v.verse_key.split(":")[1];
            return `
                <span class="ayah" onclick="getTafsir(${id}, ${num}, '${chapter.name_arabic}')">
                    ${v.text_uthmani}
                    <span class="ayah-circle">${num}</span>
                </span>
            `;
        }).join(" ");

        // البسملة (إلا الفاتحة والتوبة)
        const bismillah = (id != 1 && id != 9) ? '<div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : '';

        container.innerHTML = `
            <div class="surah-top-info">
                ${bismillah}
            </div>
            <div class="quran-text-area">
                ${versesHtml}
            </div>
        `;

    } catch (e) {
        container.innerHTML = "<p style='text-align:center;'>خطأ في الاتصال</p>";
    }
}

// دالة جلب التفسير الميسر
async function getTafsir(chapterId, verseNum, surahName) {
    const modal = document.getElementById("tafsirModal");
    const title = document.getElementById("tafsirTitle");
    const body = document.getElementById("tafsirBody");

    title.innerText = `تفسير سورة ${surahName} - آية ${verseNum}`;
    body.innerText = "جاري التحميل...";
    modal.style.display = "flex";

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${chapterId}:${verseNum}/ar.muyassar`);
        const data = await res.json();
        body.innerText = data.data.text;
    } catch (e) {
        body.innerText = "عذراً، فشل تحميل التفسير.";
    }
}

function closeTafsir() {
    document.getElementById("tafsirModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", loadSurah);
