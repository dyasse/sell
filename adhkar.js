if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker خدام بنجاح!'))
      .catch(err => console.log('وقع مشكل في الـ Service Worker', err));
  });
}
async function loadAdhkar() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "sabah";

  const title = document.getElementById("adhkarTitle");
  const subtitle = document.getElementById("adhkarSubtitle");
  const container = document.getElementById("adhkarContainer");
  const statsBox = document.getElementById("adhkarStats");

  const btnSabah = document.getElementById("btnSabah");
  const btnMasa = document.getElementById("btnMasa");
  if(type === "sabah" && btnSabah) btnSabah.classList.add("active");
  if(type === "masa" && btnMasa) btnMasa.classList.add("active");

  try {
    const response = await fetch("adhkar.json");
    const data = await response.json();

    const adhkarGroup = data[type];

    if (!adhkarGroup || !adhkarGroup.items || adhkarGroup.items.length === 0) {
      container.innerHTML = "<p style='text-align:center;'>لا توجد أذكار حالياً</p>";
      return;
    }

    title.innerHTML = `أذكار <span>${type === "sabah" ? "الصباح" : "المساء"}</span>`;
    subtitle.textContent = "حصن مسلمك بذكر الله مع العداد الذكي";

    container.innerHTML = "";

    adhkarGroup.items.forEach((dhikr, index) => {
      const card = document.createElement("div");
      card.className = "premium-adhkar-card"; 

      card.innerHTML = `
        <div class="premium-dhikr-head">
          <div>
            <h3 style="color:#1f6f50; font-size:18px; margin-bottom: 5px;">ذكر ${index + 1}</h3>
            <p class="dhikr-mini-label">ورد يومي</p>
          </div>
          <span class="repeat-badge">${dhikr.repeat} مرات</span>
        </div>

        <p class="adhkar-text">${dhikr.text}</p>

        <div style="display:flex; gap:15px; margin-bottom:15px; text-align:center;">
          <div style="flex:1; background:#f9fbfb; padding:10px; border-radius:10px;" class="mini-stat-bg">
             <span style="font-size:12px; color:#6b7d76; display:block;">المنجز</span>
             <strong id="count-${type}-${dhikr.id}" style="color:#1f6f50; font-size:20px;">0</strong>
          </div>
          <div style="flex:1; background:#f9fbfb; padding:10px; border-radius:10px;" class="mini-stat-bg">
             <span style="font-size:12px; color:#6b7d76; display:block;">المتبقي</span>
             <strong id="remaining-${type}-${dhikr.id}" style="color:#f59e0b; font-size:20px;">${dhikr.repeat}</strong>
          </div>
        </div>

        <div class="premium-progress">
          <div class="progress-bar">
            <div id="progress-${type}-${dhikr.id}" class="progress-fill"></div>
          </div>
        </div>

        <div class="premium-card-actions">
          <button onclick="increaseDhikr(event, '${type}', ${dhikr.id}, ${dhikr.repeat})">
            <i class="fa-solid fa-hand-holding-heart"></i> تسبيح
          </button>
          <button onclick="resetDhikr('${type}', ${dhikr.id}, ${dhikr.repeat})" class="soft-btn">
            <i class="fa-solid fa-rotate-right"></i> إعادة
          </button>
        </div>
      `;

      container.appendChild(card);
      updateDhikrUI(type, dhikr.id, dhikr.repeat);
    });

    updateDoneState(type, adhkarGroup.items);
    updateGroupStats(type, adhkarGroup.items, statsBox);
  } catch (error) {
    container.innerHTML = "<p style='text-align:center; color:#e74c3c;'>وقع مشكل في تحميل الأذكار. تأكد من اتصالك بالأنترنت.</p>";
    console.error(error);
  }
}

function getDhikrStorageKey(type, id) {
  return `dhikr_${type}_${id}`;
}

function increaseDhikr(event, type, id, repeat) {
  const key = getDhikrStorageKey(type, id);
  let count = parseInt(localStorage.getItem(key) || "0", 10);

  if (count < repeat) {
    count++;
    localStorage.setItem(key, count);
    
    // أنيميشن صغيرة للزر
    const btn = event.currentTarget;
    btn.style.transform = "scale(0.95)";
    setTimeout(() => btn.style.transform = "scale(1)", 150);

    updateDhikrUI(type, id, repeat);
    refreshGroupCompletion(type);
  }
}

function resetDhikr(type, id, repeat) {
  const key = getDhikrStorageKey(type, id);
  localStorage.setItem(key, 0);
  updateDhikrUI(type, id, repeat);
  refreshGroupCompletion(type);
}

function updateDhikrUI(type, id, repeat) {
  const key = getDhikrStorageKey(type, id);
  const count = parseInt(localStorage.getItem(key) || "0", 10);

  const countEl = document.getElementById(`count-${type}-${id}`);
  const remainingEl = document.getElementById(`remaining-${type}-${id}`);
  const progressEl = document.getElementById(`progress-${type}-${id}`);

  if (countEl) countEl.textContent = count;
  if (remainingEl) remainingEl.textContent = Math.max(repeat - count, 0);

  const percent = Math.min((count / repeat) * 100, 100);

  if (progressEl) {
    progressEl.style.width = `${percent}%`;
    if (percent === 100) {
      progressEl.style.background = "linear-gradient(90deg, #10b981, #34d399)";
    } else {
      progressEl.style.background = "linear-gradient(90deg, #1f6f50, #a3e4c7)";
    }
  }
}

async function refreshGroupCompletion(type) {
  try {
    const response = await fetch("adhkar.json");
    const data = await response.json();
    const adhkarGroup = data[type];
    const statsBox = document.getElementById("adhkarStats");

    if (!adhkarGroup) return;

    updateDoneState(type, adhkarGroup.items);
    updateGroupStats(type, adhkarGroup.items, statsBox);
  } catch(e) {
    console.log(e);
  }
}

function updateDoneState(type, items) {
  const doneBox = document.getElementById("doneBox");
  
  const allDone = items.every(item => {
    const count = parseInt(localStorage.getItem(getDhikrStorageKey(type, item.id)) || "0", 10);
    return count >= item.repeat;
  });

  if (allDone) {
    doneBox.style.display = "block";
    doneBox.innerHTML = '<i class="fa-solid fa-check-circle"></i> ما شاء الله، لقد أكملت جميع الأذكار بنجاح';
  } else {
    doneBox.style.display = "none";
  }
}

function updateGroupStats(type, items, statsBox) {
  const total = items.length;
  let completed = 0;
  let totalRequired = 0;
  let totalDone = 0;

  items.forEach(item => {
    const count = parseInt(localStorage.getItem(getDhikrStorageKey(type, item.id)) || "0", 10);
    totalRequired += item.repeat;
    totalDone += Math.min(count, item.repeat);
    if (count >= item.repeat) completed++;
  });

  const percent = totalRequired > 0 ? Math.round((totalDone / totalRequired) * 100) : 0;

  statsBox.innerHTML = `
    <div class="stat-card">
      <span class="stat-label">مجموع الأذكار</span>
      <strong>${total}</strong>
    </div>
    <div class="stat-card">
      <span class="stat-label">تم إنجازه</span>
      <strong>${completed}</strong>
    </div>
    <div class="stat-card">
      <span class="stat-label">نسبة الإكتمال</span>
      <strong>${percent}%</strong>
    </div>
  `;
}

// ==========================================
// قسم الإشعارات (Notifications)
// ==========================================
function setupNotifications() {
  const notifBtn = document.getElementById("notifToggle");
  if (!notifBtn) return;

  if (Notification.permission === "granted") {
    notifBtn.innerHTML = '<i class="fa-solid fa-bell" style="color:#f59e0b;"></i>';
    startNotificationChecker();
  }

  notifBtn.addEventListener("click", () => {
    if (!("Notification" in window)) {
      alert("عذراً، متصفحك لا يدعم الإشعارات.");
      return;
    }

    if (Notification.permission === "granted") {
      alert("الإشعارات مفعلة مسبقاً. سيصلك تذكير صباحاً ومساءً.");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          notifBtn.innerHTML = '<i class="fa-solid fa-bell" style="color:#f59e0b;"></i>';
          alert("تم تفعيل الإشعارات بنجاح! 🔔");
          startNotificationChecker();
        } else {
          alert("لم تقم بتفعيل الإشعارات.");
        }
      });
    } else {
      alert("لقد قمت بحظر الإشعارات من إعدادات المتصفح.");
    }
  });
}

function startNotificationChecker() {
  setInterval(checkTimeForAdhkar, 60000); // يفحص الوقت كل دقيقة
  checkTimeForAdhkar(); 
}

function checkTimeForAdhkar() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // تذكير أذكار الصباح مع 07:00
  if (hours === 7 && minutes === 0) {
    sendNotification("أذكار الصباح ☀️", "حان الآن موعد أذكار الصباح، ابدأ يومك بذكر الله وحصن نفسك.", "sabah");
  }
  
  // تذكير أذكار المساء مع 17:00 (الخامسة مساء)
  if (hours === 17 && minutes === 0) {
    sendNotification("أذكار المساء 🌙", "حان الآن موعد أذكار المساء، اختم يومك بذكر الله والطمأنينة.", "masa");
  }
}

function sendNotification(title, body, type) {
  const dateKey = new Date().toDateString();
  const storageKey = `notif_sent_${type}_${dateKey}`;

  if (localStorage.getItem(storageKey)) return; 

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body: body,
      icon: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png", 
      dir: "rtl"
    });

    notification.onclick = function() {
      window.focus();
      window.location.href = `adhkar.html?type=${type}`;
    };

    localStorage.setItem(storageKey, "true");
  }
}

// ==========================================
// الوضع الليلي
// ==========================================
function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      }
    });
  }
}

// تشغيل كل شيء عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadAdhkar();
  setupTheme();
  setupNotifications();
});
