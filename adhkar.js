async function loadAdhkar() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "sabah";

  const title = document.getElementById("adhkarTitle");
  const subtitle = document.getElementById("adhkarSubtitle");
  const container = document.getElementById("adhkarContainer");
  const statsBox = document.getElementById("adhkarStats");

  // Highlight active button in hero
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
      card.className = "premium-adhkar-card"; // Class updated for new CSS

      card.innerHTML = `
        <div class="premium-dhikr-head">
          <div>
            <h3 style="color:#1f6f50; font-size:18px;">ذكر ${index + 1}</h3>
            <p class="dhikr-mini-label">ورد يومي</p>
          </div>
          <span class="repeat-badge">${dhikr.repeat} مرات</span>
        </div>

        <p class="adhkar-text">${dhikr.text}</p>

        <div style="display:flex; gap:15px; margin-bottom:15px; text-align:center;">
          <div style="flex:1; background:#f9fbfb; padding:10px; border-radius:10px;">
             <span style="font-size:12px; color:#6b7d76; display:block;">المنجز</span>
             <strong id="count-${type}-${dhikr.id}" style="color:#1f6f50; font-size:20px;">0</strong>
          </div>
          <div style="flex:1; background:#f9fbfb; padding:10px; border-radius:10px;">
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
          <button onclick="increaseDhikr('${type}', ${dhikr.id}, ${dhikr.repeat})">
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
    container.innerHTML = "<p style='text-align:center; color:#e74c3c;'>وقع مشكل في تحميل الأذكار. تأكد من اتصالك.</p>";
    console.error(error);
  }
}

function getDhikrStorageKey(type, id) {
  return `dhikr_${type}_${id}`;
}

function increaseDhikr(type, id, repeat) {
  const key = getDhikrStorageKey(type, id);
  let count = parseInt(localStorage.getItem(key) || "0", 10);

  if (count < repeat) {
    count++;
    localStorage.setItem(key, count);
    
    // Add a tiny animation to the button
    const btn = event.currentTarget;
    btn.style.transform = "scale(0.95)";
    setTimeout(() => btn.style.transform = "scale(1) translateY(-2px)", 100);

    updateDhikrUI(type, id, repeat);
    refreshGroupCompletion(type);

    if (count === repeat) {
       // Optional: play a subtle sound or just show an alert
       // alert("ما شاء الله، أكملت هذا الذكر");
    }
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
      progressEl.style.background = "linear-gradient(90deg, #10b981, #34d399)"; // Green when done
    } else {
      progressEl.style.background = "linear-gradient(90deg, #1f6f50, #a3e4c7)"; // Normal color
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

    if (count >= item.repeat) {
      completed++;
    }
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

document.addEventListener("DOMContentLoaded", () => {
  loadAdhkar();
  setupTheme();
});
