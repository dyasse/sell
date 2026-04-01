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
async function loadSurah() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id")); // تحويل المعرف لرقم
    const container = document.getElementById("quranDetails");

    if (!id) return;

    try {
        const [chapRes, versRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
        ]);

        const chapData = await chapRes.json();
        const versData = await versRes.json();
        const chapter = chapData.chapter;
        
        document.getElementById("surahName").innerText = "سورة " + chapter.name_arabic;

        const versesHtml = versData.verses.map(v => {
            const num = v.verse_key.split(":")[1];
            return `
                <span class="ayah" id="ayah-${num}" onclick="saveBookmarkAndTafsir(${id}, ${num}, '${chapter.name_arabic}')">
                    ${v.text_uthmani}
                    <span class="ayah-circle">${num}</span>
                </span>
            `;
        }).join(" ");

        const bismillah = (id !== 1 && id !== 9) ? '<div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : '';

        // تحديد السورة التالية
        const nextSurahBtn = id < 114 ? 
            `<button onclick="location.href='details.html?id=${id + 1}'" class="next-btn">السورة التالية: ${id + 1} <i class="fa-solid fa-chevron-left"></i></button>` : '';

        container.innerHTML = `
            <div class="surah-top-info">${bismillah}</div>
            <div class="quran-text-area">${versesHtml}</div>
            <div class="navigation-footer">
                ${nextSurahBtn}
            </div>
        `;

        // ميزة: النزول التلقائي للآية المحفوظة (إذا دخل من بوطون "واصل القراءة")
        const targetAyah = params.get("ayah");
        if (targetAyah) {
            setTimeout(() => {
                const element = document.getElementById(`ayah-${targetAyah}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.background = "rgba(245, 158, 11, 0.15)";
                }
            }, 500);
        }

    } catch (e) { container.innerHTML = "<p>خطأ في التحميل</p>"; }
}

// حفظ العلامة + فتح التفسير
function saveBookmarkAndTafsir(chapterId, verseNum, surahName) {
    const bookmark = { id: chapterId, verse: verseNum, name: surahName };
    localStorage.setItem("nour_bookmark", JSON.stringify(bookmark));
    
    // مناداة دالة التفسير اللي صاوبنا قبل
    getTafsir(chapterId, verseNum, surahName);
}

document.addEventListener("DOMContentLoaded", loadSurah);
