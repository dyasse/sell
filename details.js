/**
 * دالة تحميل تفاصيل السورة والآيات بالخط العثماني
 */
async function loadDetails() {
    const params = new URLSearchParams(window.location.search);
    const chapterId = params.get("id");
    const detailsCard = document.getElementById("detailsCard");

    // التحقق من وجود المعرف
    if (!chapterId) {
        detailsCard.innerHTML = "<p style='text-align:center; padding:50px;'>عذراً، لم يتم العثور على السورة.</p>";
        return;
    }

    try {
        // جلب بيانات السورة + النص العثماني في طلب واحد
        const [chapRes, versRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/chapters/${chapterId}?language=ar`),
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`)
        ]);

        if (!chapRes.ok || !versRes.ok) throw new Error("API Error");

        const chapData = await chapRes.json();
        const versData = await versRes.json();

        const chapter = chapData.chapter;
        const verses = versData.verses;

        // بناء النص القرآني
        const versesHtml = verses.map(v => {
            const ayahNumber = v.verse_key.split(":")[1];
            return `
                <span class="ayah-item" onclick="showTafsir(${chapterId}, ${ayahNumber}, '${chapter.name_arabic}')" style="cursor:pointer; display:inline;">
                    <span class="quran-text">${v.text_uthmani}</span>
                    <span class="ayah-num" style="display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--primary); border-radius:50%; width:35px; height:35px; font-family:'Cairo'; font-size:16px; margin:0 5px; color:var(--primary);">${ayahNumber}</span>
                </span>
            `;
        }).join(" ");

        // إضافة البسملة (باستثناء الفاتحة والتوبة)
        const bismillah = (chapterId != 1 && chapterId != 9) ? 
            '<p style="font-family:Amiri; font-size:35px; margin:30px 0; color:var(--primary); text-align:center;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>' : '';

        // عرض السورة في الصفحة
        detailsCard.innerHTML = `
            <div class="surah-header" style="text-align:center; margin-bottom:40px;">
                <h1 style="font-family:Amiri; font-size:50px; color:var(--primary); margin:0;">سورة ${chapter.name_arabic}</h1>
                <p style="opacity:0.7; font-family:'Cairo';">${chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} | ${chapter.verses_count} آية</p>
                ${bismillah}
            </div>
            <div class="quran-container">
                <div class="quran-text" style="text-align: center; word-wrap: break-word;">
                    ${versesHtml}
                </div>
            </div>
            <div style="text-align:center; margin-top:50px;">
                <button onclick="location.href='quran.html'" class="pay-now-btn" style="width:auto; padding:10px 40px; font-family:'Cairo';">عودة للفهرس</button>
            </div>
        `;

    } catch (error) {
        console.error("Error loading Quran:", error);
        detailsCard.innerHTML = `
            <div style="text-align:center; padding:50px; color:red;">
                <i class="fa-solid fa-triangle-exclamation fa-3x"></i>
                <p style="margin-top:15px; font-family:'Cairo';">حدث خطأ في تحميل السورة. تأكد من الاتصال بالإنترنت.</p>
                <button onclick="location.reload()" class="pay-now-btn" style="width:auto; margin-top:10px;">إعادة المحاولة</button>
            </div>
        `;
    }
}

/**
 * دالة جلب التفسير الميسر وعرضه في نافذة منبثقة
 */
async function showTafsir(cid, vnum, sname) {
    const modal = document.getElementById("tafsirModal");
    const tText = document.getElementById("tafsirText");
    const tTitle = document.getElementById("tafsirTitle");

    tTitle.textContent = `تفسير سورة ${sname} - آية ${vnum}`;
    tText.innerHTML = '<p style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> جاري جلب التفسير...</p>';
    modal.style.display = "flex";

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${cid}:${vnum}/ar.muyassar`);
        const data = await res.json();
        
        if (data.status === "OK") {
            tText.innerHTML = `<p>${data.data.text}</p>`;
        } else {
            tText.innerHTML = "تعذر تحميل التفسير حالياً.";
        }
    } catch (e) {
        tText.innerHTML = "خطأ في الاتصال بالسيرفر.";
    }
}

function closeTafsir() {
    document.getElementById("tafsirModal").style.display = "none";
}

// إغلاق المودال عند الضغط خارجه
window.onclick = function(event) {
    const modal = document.getElementById("tafsirModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// الوضع الليلي
function setupTheme() {
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") document.body.classList.add("dark");

    if (themeToggle) {
        themeToggle.onclick = () => {
            document.body.classList.toggle("dark");
            localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
        };
    }
}

// التشغيل عند جاهزية الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadDetails();
    setupTheme();
});
