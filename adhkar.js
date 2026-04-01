// بيانات الأذكار (مختصرة كمثال، غانستعملو API للأذكار كاملة)
async function loadAdhkar() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const container = document.getElementById("adhkarList");
    const title = document.getElementById("adhkarTitle");

    // عناوين الصفحات
    const titles = {
        sabah: "أذكار الصباح",
        masa: "أذكار المساء",
        nawm: "أذكار النوم",
        shita: "أذكار الشتاء والمطر",
        khouroj: "أذكار الخروج",
        dokhol: "أذكار الدخول"
    };
    title.innerText = titles[type] || "الأذكار";

    try {
        // غانستعملو API ديال الأذكار المعروفة
        const response = await fetch('https://raw.githubusercontent.com/nawafalqari/azkar-api/master/azkar.json');
        const data = await response.json();
        
        // تحويل النوع ليتناسب مع الـ API
        let category = "";
        if(type === 'sabah') category = "أذكار الصباح";
        else if(type === 'masa') category = "أذكار المساء";
        else if(type === 'nawm') category = "أذكار النوم";
        else if(type === 'shita') category = "أذكار المطر"; // أو الشتاء
        else if(type === 'khouroj') category = "أذكار الخروج من المنزل";
        else if(type === 'dokhol') category = "أذكار الدخول إلى المنزل";

        const list = data[category] || [];

        container.innerHTML = list.map((item, index) => `
            <div class="adhkar-card" id="zekr-${index}" onclick="countDown(${index}, ${item.count})">
                <p class="zekr-text">${item.content}</p>
                <div class="zekr-footer">
                    <span class="zekr-hint">${item.description || ''}</span>
                    <div class="counter-badge" id="count-${index}">${item.count}</div>
                </div>
            </div>
        `).join('');

    } catch (e) {
        container.innerHTML = "<p style='text-align:center;'>خطأ في تحميل الأذكار</p>";
    }
}

// دالة العداد
function countDown(index, max) {
    const badge = document.getElementById(`count-${index}`);
    const card = document.getElementById(`zekr-${index}`);
    let current = parseInt(badge.innerText);

    if (current > 0) {
        current--;
        badge.innerText = current;
        
        // فاش كيسالي الذكر
        if (current === 0) {
            card.style.opacity = "0.5";
            card.style.border = "2px solid #1f6f50";
            badge.innerHTML = '<i class="fa-solid fa-check"></i>';
            // اهتزاز خفيف (اختياري)
            if (window.navigator.vibrate) window.navigator.vibrate(50);
        }
    }
}

document.addEventListener("DOMContentLoaded", loadAdhkar);
