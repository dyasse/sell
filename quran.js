async function loadQuran() {
    const container = document.getElementById("quranContainer");
    if (!container) return;

    try {
        const res = await fetch("https://api.quran.com/api/v4/chapters?language=ar");
        const data = await res.json();
        
        let html = `
            <div style="background:var(--card); border-radius:20px; overflow:hidden; box-shadow:var(--shadow);">
                <table style="width:100%; border-collapse:collapse; text-align:center;">
                    <thead style="background:#f1f5f9; color:var(--primary);">
                        <tr><th style="padding:15px;">#</th><th style="padding:15px;">السورة</th><th style="padding:15px;">الآيات</th></tr>
                    </thead>
                    <tbody>
        `;

        data.chapters.forEach(s => {
            html += `
                <tr onclick="location.href='details.html?id=${s.id}'" style="border-bottom:1px solid #eee; cursor:pointer;">
                    <td style="padding:15px;">${s.id}</td>
                    <td style="padding:15px; font-family:Amiri; font-size:20px; font-weight:bold; color:var(--primary);">${s.name_arabic}</td>
                    <td style="padding:15px;">${s.verses_count}</td>
                </tr>
            `;
        });

        container.innerHTML = html + "</tbody></table></div>";
    } catch (e) { container.innerHTML = "<p>فشل التحميل.</p>"; }
}
document.addEventListener("DOMContentLoaded", loadQuran);
