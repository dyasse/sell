async function loadAdhkar() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "sabah";

  const title = document.getElementById("adhkarTitle");
  const subtitle = document.getElementById("adhkarSubtitle");
  const container = document.getElementById("adhkarContainer");
  const statsBox = document.getElementById("adhkarStats");

  try {
    const response = await fetch("adhkar.json");
    const data = await response.json();

    const adhkarGroup = data[type];

    if (!adhkarGroup || !adhkarGroup.items || adhkarGroup.items.length === 0) {
      container.innerHTML = "<p>ما كايناش أذكار حالياً</p>";
      return;
    }

    title.textContent = adhkarGroup.title;
    subtitle.textContent = type === "masa"
      ? "وردك المسائي مع تتبع التقدم"
      : "وردك الصباحي مع تتبع التقدم";

    container.innerHTML = "";

    adhkarGroup.items.forEach((dhikr, index) => {
      const card = document.createElement("div");
      card.className = "card adhkar-card premium-adhkar-card";

      card.innerHTML = `
        <div class="dhikr-head premium-dhikr-head">
          <div>
            <h3>ذكر ${index + 1}</h3>
            <p class="dhikr-mini-label">ذكر يومي</p>
          </div>
          <span class="repeat-badge">${dhikr.repeat} مرات</span>
        </div>

        <p class="content-text adhkar-text">${dhikr.text}</p>

        <div class="dhikr-stats premium-dhikr-stats">
          <div class="mini-stat">
            <span class="mini-stat-label">المنجز</span>
            <strong id="count-${type}-${dhikr.id}">0</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-label">المتبقي</span>
            <strong id="remaining-${type}-${dhikr.id}">${dhikr.repeat}</strong>
          </div>
        </div>

        <div class="progress-bar small-progress premium-progress">
          <div id="progress-${type}-${dhikr.id}" class="progress-fill"></div>
        </div>

        <div class="card-actions premium-card-actions">
          <button onclick="increaseDhikr('${type}', ${dhikr.id}, ${dhikr.repeat})">تسبيح</button>
          <button onclick="resetDhikr('${type}', ${dhikr.id}, ${dhikr.repeat})" class="soft-btn">إعادة</button>
        </div>
      `;

      container.appendChild(card);
      updateDhikrUI(type, dhikr.id, dhikr.repeat);
    });

    updateDoneState(type, adhkarGroup.items);
    updateGroupStats(type, adhkarGroup.items, statsBox);
  } catch (error) {
    container.innerHTML = "<p>وقع مشكل فتحميل الأذكار</p>";
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
    updateDhikrUI(type, id, repeat);
    refreshGroupCompletion(type);

    if (count === repeat) {
      alert("ما شاء الله، كملتي هاد الذكر");
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
      progressEl.classList.add("progress-done");
    } else {
      progressEl.classList.remove("progress-done");
    }
  }
}

async function refreshGroupCompletion(type) {
  const response = await fetch("adhkar.json");
  const data = await response.json();
  const adhkarGroup = data[type];
  const statsBox = document.getElementById("adhkarStats");

  if (!adhkarGroup) return;

  updateDoneState(type, adhkarGroup.items);
  updateGroupStats(type, adhkarGroup.items, statsBox);
}

function updateDoneState(type, items) {
  const doneBox = document.getElementById("doneBox");

  const allDone = items.every(item => {
    const count = parseInt(localStorage.getItem(getDhikrStorageKey(type, item.id)) || "0", 10);
    return count >= item.repeat;
  });

  if (allDone) {
    doneBox.style.display = "block";
    doneBox.textContent = "ما شاء الله، أكملتي جميع الأذكار ✅";
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
      <span class="stat-label">عدد الأذكار</span>
      <strong>${total}</strong>
    </div>
    <div class="stat-card">
      <span class="stat-label">المكتمل</span>
      <strong>${completed}</strong>
    </div>
    <div class="stat-card">
      <span class="stat-label">نسبة التقدم</span>
      <strong>${percent}%</strong>
    </div>
  `;
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) themeToggle.textContent = "☀️ الوضع النهاري";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");

      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ الوضع النهاري";
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 الوضع الليلي";
      }
    });
  }
}

loadAdhkar();
setupTheme();
