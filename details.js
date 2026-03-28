async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  const response = await fetch("products.json");
  const data = await response.json();

  const item = data.find(entry => entry.id === id);
  const detailsCard = document.getElementById("detailsCard");

  if (!item) {
    detailsCard.innerHTML = "<p>العنصر غير موجود</p>";
    return;
  }

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const isFavorite = favorites.includes(item.id);

  let count = 0;
  let target = 33;

  detailsCard.innerHTML = `
    <h2>${item.title}</h2>
    <p><strong>${item.subtitle}</strong></p>
    <p class="content-text">${item.content}</p>

    <div class="counter-box">
      <h3>العدّاد الذكي</h3>

      <div class="target-buttons">
        <button id="target33" class="target-btn active-target">33</button>
        <button id="target100" class="target-btn">100</button>
      </div>

      <p>العدد الحالي: <span id="counter">0</span></p>
      <p>الهدف: <span id="targetValue">33</span></p>
      <p>المتبقي: <span id="remainingValue">33</span></p>

      <div class="progress-wrapper">
        <div class="progress-bar">
          <div id="progressFill" class="progress-fill"></div>
        </div>
        <p class="progress-text"><span id="progressPercent">0</span>%</p>
      </div>

      <button id="increaseBtn">اضغط للتسبيح</button>
      <button id="resetBtn">إعادة</button>
    </div>

    <button id="favoriteBtn">
      ${isFavorite ? "موجود في المفضلة" : "إضافة إلى المفضلة"}
    </button>
  `;

  const counterEl = document.getElementById("counter");
  const targetValueEl = document.getElementById("targetValue");
  const remainingValueEl = document.getElementById("remainingValue");
  const progressFillEl = document.getElementById("progressFill");
  const progressPercentEl = document.getElementById("progressPercent");
  const target33Btn = document.getElementById("target33");
  const target100Btn = document.getElementById("target100");

  function updateCounterDisplay() {
    counterEl.textContent = count;
    targetValueEl.textContent = target;
    remainingValueEl.textContent = Math.max(target - count, 0);

    const percent = Math.min((count / target) * 100, 100);
    progressFillEl.style.width = `${percent}%`;
    progressPercentEl.textContent = Math.round(percent);

    if (percent === 100) {
      progressFillEl.classList.add("progress-done");
    } else {
      progressFillEl.classList.remove("progress-done");
    }
  }

  function setTarget(newTarget) {
    target = newTarget;
    count = 0;
    updateCounterDisplay();

    target33Btn.classList.remove("active-target");
    target100Btn.classList.remove("active-target");

    if (target === 33) {
      target33Btn.classList.add("active-target");
    } else {
      target100Btn.classList.add("active-target");
    }
  }

  target33Btn.addEventListener("click", () => {
    setTarget(33);
  });

  target100Btn.addEventListener("click", () => {
    setTarget(100);
  });

  document.getElementById("increaseBtn").addEventListener("click", () => {
    if (count < target) {
      count++;
      updateCounterDisplay();

      if (count === target) {
        alert(`ما شاء الله! وصلتي ${target}`);
      }
    }
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    count = 0;
    updateCounterDisplay();
  });

  document.getElementById("favoriteBtn").addEventListener("click", () => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(item.id)) {
      favorites.push(item.id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      alert("تمت الإضافة إلى المفضلة");
    } else {
      alert("هذا العنصر موجود بالفعل في المفضلة");
    }
  });

  updateCounterDisplay();
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) {
      themeToggle.textContent = "☀️ الوضع النهاري";
    }
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

loadDetails();
setupTheme();
