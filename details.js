async function loadSurah() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id")) || 1; // رقم السورة
    const targetAyah = params.get("ayah"); // الآية المحفوظة (إلا جا من البوكمارك)
    const container = document.getElementById("quranArea");

    try {
        // جلب البيانات من الـ API
        const [chapRes, versRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/chapters/${id}?language=ar`),
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
        ]);

        const chapData = await chapRes.json();
        const versData = await versRes.json();
        const chapter = chapData.chapter;

        // تحديث عنوان الصفحة بالنافبار
        document.getElementById("surahTitle").innerText = "سورة " + chapter.name_arabic;

        // بناء الآيات بخط عثماني كبير وقابلية الضغط للتفسير
        const versesHtml = versData.verses.map(v => {
            const num = v.verse_key.split(":")[1];
            return `
                <span class="quran-text" id="ayah-${num}" onclick="saveAndTafsir(${id}, ${num}, '${chapter.name_arabic}')" style="cursor:pointer;">
                    ${v.text_uthmani} <span class="ayah-num">${num}</span>
                </span>
            `;
        }).join("");

        // البسملة (إلا فـ الفاتحة والتوبة)
        const bismillah = (id !== 1 && id !== 9) ? '<div style="font-family: Amiri; font-size: 35px; text-align: center; margin-bottom: 30px; color: var(--primary);">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : '';
        
        // زر السورة التالية
        const nextBtn = id < 114 ? `
            <div style="text-align: center; margin-top: 40px;">
                <button onclick="location.href='details.html?id=${id+1}'" style="background: var(--primary); color: white; border: none; padding: 15px 40px; border-radius: 15px; font-family: Cairo; font-weight: bold; cursor: pointer;">
                    السورة التالية <i class="fa-solid fa-chevron-left" style="margin-right: 10px;"></i>
                </button>
            </div>` : '';

        // عرض المحتوى
        container.innerHTML = bismillah + versesHtml + nextBtn;

        // إلا كان جاي من علامة قديمة، هبطو لعندها نيشان
        if (targetAyah) {
            setTimeout(() => {
                const el = document.getElementById(`ayah-${targetAyah}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.style.backgroundColor = "rgba(31, 111, 80, 0.1)"; // تلوين خفيف للآية
                }
            }, 600);
        }

    } catch (e) {
        container.innerHTML = "<p style='text-align:center;'>خطأ في تحميل السورة. تأكد من الاتصال بالإنترنت.</p>";
    }
}

// حفظ العلامة وإظهار التفسير
function saveAndTafsir(id, verse, name) {
    // حفظ فـ localStorage
    localStorage.setItem("nour_bookmark", JSON.stringify({ id, verse, name }));
    
    // إظهار المودال
    const modal = document.getElementById("tafsirModal");
    document.getElementById("tTitle").innerText = `تفسير سورة ${name} - آية ${verse}`;
    document.getElementById("tBody").innerText = "جاري جلب التفسير...";
    modal.style.display = "flex";

    // جلب التفسير الميسر
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

document.addEventListener("DOMContentLoaded", loadSurah);
