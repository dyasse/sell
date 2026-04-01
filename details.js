async function loadSurah() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || 1;
    const targetAyah = params.get("ayah"); // لجلب الآية المحفوظة
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
                <span class="ayah-text" id="ayah-${num}" onclick="saveAndTafsir(${id}, ${num}, '${chapter.name_arabic}')">
                    ${v.text_uthmani} <span class="ayah-num">${num}</span>
                </span>
            `;
        }).join("");

        container.innerHTML = versesHtml;

        // ميزة: النزول التلقائي للآية المحفوظة
        if (targetAyah) {
            setTimeout(() => {
                const element = document.getElementById(`ayah-${targetAyah}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.backgroundColor = "rgba(31, 111, 80, 0.1)"; // تلوين خفيف
                }
            }, 500);
        }

    } catch (e) { console.error(e); }
}

function saveAndTafsir(id, verse, name) {
    // حفظ في localStorage
    const bookmark = { id: id, verse: verse, name: name };
    localStorage.setItem("nour_bookmark", JSON.stringify(bookmark));
    
    // فتح التفسير (الدالة اللي صاوبنا قبل)
    openTafsir(id, verse, name);
}

function openTafsir(id, v, name) {
    const modal = document.getElementById("tafsirModal");
    document.getElementById("tTitle").innerText = `سورة ${name} - آية ${v}`;
    modal.style.display = "flex";
    
    fetch(`https://api.alquran.cloud/v1/ayah/${id}:${v}/ar.muyassar`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("tBody").innerText = data.data.text;
        });
}

function closeTafsir() { document.getElementById("tafsirModal").style.display = "none"; }

document.addEventListener("DOMContentLoaded", loadSurah);
