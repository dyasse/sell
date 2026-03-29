async function loadAdhkar() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "sabah";

  const title = document.getElementById("adhkarTitle");
  const subtitle = document.getElementById("adhkarSubtitle");
  const container = document.getElementById("adhkarContainer");
  const doneBox = document.getElementById("doneBox");

  try {
    const response = await fetch("adhkar.json");
    const data = await response.json();

    const adhkarGroup = data[type];

    if (!adhkarGroup || !adhkarGroup.items || adhkarGroup.items.length === 0) {
      container.innerHTML = "<p>ما كايناش أذكار حالياً</p>";
      return;
    }

    title.textContent = adhkarGroup.title;
    subtitle.textContent = "أذكار يومية مع عداد ذكي";

    container.innerHTML = "";

    adhkarGroup.items.forEach((dhikr, index) => {
      const card = document.createElement("div");
      card.className = "card adhkar-card";

      card.innerHTML = `
        <div class="dhikr-head">
          <h3>ذكر ${index + 1}</h3>
          <span class="repeat-badge">${dhikr.repeat} مرات</span>
        </div>

        <p class="content-text">${dhikr.text}</p>

        <div class="dhikr-stats">
          <p>المنجز: <span id="count-${type}-${dhikr.id}">0</span></p>
          <p>المتبقي: <span id="remaining-${type}-${dhikr.id}">${dhikr.repeat}</span></p>
        </div>

        <div class="card-actions">
          <button onclick="increaseDhikr('${type}', ${dhikr.id}, ${dhikr.repeat})">تسبيح</button>
          <button onclick="resetDhikr('${type}', ${dhikr.id}, ${dhikr.repeat})">إعادة</button>
        </div>

        <div class="progress-bar small-progress">
          <div id="progress-${type}-${dhikr.id}" class="progress-fill"></div>
        </div>
      `;

      container.appendChild(card);
      updateDhikrUI(type, dhikr.id, dhikr.repeat);
    });

    updateDoneState(type, adhkarGroup.items);
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

  if (!adhkarGroup) return;

  updateDoneState(type, adhkarGroup.items);
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
