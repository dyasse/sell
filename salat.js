const prayerNames = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

let currentCoords = null;
let currentCity = "";
let prayerTimesToday = null;
let nextPrayerTimer = null;
let adhanCheckTimer = null;
let lastNotifiedPrayerKey = null;
let qiblaDirection = null;

function $(id) {
  return document.getElementById(id);
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function parseTimeToDate(timeString) {
  const clean = String(timeString).split(" ")[0];
  const [hours, minutes] = clean.split(":").map(Number);
  const now = new Date();
  const d = new Date();
  d.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  d.setHours(hours || 0, minutes || 0, 0, 0);
  return d;
}

function getNextPrayerInfo(times) {
  const now = new Date();
  const ordered = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  for (const key of ordered) {
    const prayerDate = parseTimeToDate(times[key]);
    if (prayerDate > now) {
      return {
        key,
        label: prayerNames[key],
        date: prayerDate,
      };
    }
  }

  const tomorrowFajr = parseTimeToDate(times.Fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);

  return {
    key: "Fajr",
    label: prayerNames.Fajr,
    date: tomorrowFajr,
  };
}

function renderPrayerTimes(times) {
  const container = $("prayerTimes");
  if (!container) return;

  const nextInfo = getNextPrayerInfo(times);

  container.innerHTML = Object.keys(prayerNames)
    .map((key) => {
      const isNext = nextInfo.key === key;
      return `
        <div class="prayer-card ${isNext ? "next-prayer-card" : ""}">
          <div class="prayer-card-icon">
            <i class="fa-regular fa-clock"></i>
          </div>
          <div class="prayer-name">${prayerNames[key]}</div>
          <div class="prayer-time">${times[key]}</div>
          <div class="prayer-badge">${isNext ? "الصلاة القادمة" : "اليوم"}</div>
        </div>
      `;
    })
    .join("");
}

function updateNextPrayerUI() {
  if (!prayerTimesToday) return;

  const nextInfo = getNextPrayerInfo(prayerTimesToday);
  const now = new Date();
  const diff = nextInfo.date - now;

  $("nextPrayerText").textContent = `الصلاة القادمة: ${nextInfo.label}`;
  $("countdownValue").textContent = formatRemaining(diff);

  renderPrayerTimes(prayerTimesToday);
}

function startCountdown() {
  if (nextPrayerTimer) clearInterval(nextPrayerTimer);

  updateNextPrayerUI();

  nextPrayerTimer = setInterval(() => {
    updateNextPrayerUI();
  }, 1000);
}

function notificationEnabled() {
  return "Notification" in window && Notification.permission === "granted";
}

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("المتصفح لا يدعم الإشعارات.");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      alert("تم تفعيل التنبيهات.");
    } else {
      alert("لم يتم السماح بالإشعارات.");
    }
  });
}

function checkForAdhanNotification() {
  if (!prayerTimesToday || !notificationEnabled()) return;

  const now = new Date();
  const ordered = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  for (const key of ordered) {
    const prayerDate = parseTimeToDate(prayerTimesToday[key]);
    const diff = Math.abs(now - prayerDate);

    if (
      diff < 30000 &&
      lastNotifiedPrayerKey !== `${key}-${now.toDateString()}`
    ) {
      lastNotifiedPrayerKey = `${key}-${now.toDateString()}`;

      new Notification(`حان الآن وقت صلاة ${prayerNames[key]}`, {
        body: currentCity
          ? `المدينة: ${currentCity}`
          : "تطبيق نور يذكرك بموعد الصلاة.",
        icon: "assets/favicon.png",
        badge: "assets/favicon.png",
      });
    }
  }
}

function startAdhanWatcher() {
  if (adhanCheckTimer) clearInterval(adhanCheckTimer);

  checkForAdhanNotification();

  adhanCheckTimer = setInterval(() => {
    checkForAdhanNotification();
  }, 15000);
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`
    );
    const data = await res.json();
    return (
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      "موقعك الحالي"
    );
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return "موقعك الحالي";
  }
}

async function getPrayerTimes(lat, lon) {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${today.getDate()}-${month}-${year}?latitude=${lat}&longitude=${lon}&method=3`
  );

  if (!res.ok) {
    throw new Error(`Prayer API error ${res.status}`);
  }

  const data = await res.json();
  const timings = data?.data?.timings;

  return {
    Fajr: timings.Fajr,
    Dhuhr: timings.Dhuhr,
    Asr: timings.Asr,
    Maghrib: timings.Maghrib,
    Isha: timings.Isha,
  };
}

async function getQiblaDirection(lat, lon) {
  const res = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`);

  if (!res.ok) {
    throw new Error(`Qibla API error ${res.status}`);
  }

  const data = await res.json();
  return Number(data?.data?.direction || 0);
}

async function loadPrayerExperience(lat, lon) {
  $("prayerTimes").innerHTML = `<div class="status-box">جاري تحميل أوقات الصلاة...</div>`;

  try {
    const [city, times, qibla] = await Promise.all([
      reverseGeocode(lat, lon),
      getPrayerTimes(lat, lon),
      getQiblaDirection(lat, lon),
    ]);

    currentCity = city;
    prayerTimesToday = times;
    qiblaDirection = qibla;

    $("locationText").textContent = "تم تحديد موقعك بنجاح";
    $("cityName").textContent = currentCity;
    $("qiblaAngle").textContent = `${Math.round(qiblaDirection)}°`;

    renderPrayerTimes(prayerTimesToday);
    startCountdown();
    startAdhanWatcher();
  } catch (error) {
    console.error(error);
    $("locationText").textContent = "تعذر تحميل البيانات الحالية";
    $("cityName").textContent = "غير متاح";
    $("prayerTimes").innerHTML = `<div class="status-box">تعذر تحميل أوقات الصلاة حالياً.</div>`;
  }
}

function locateUser() {
  $("locationText").textContent = "جاري تحديد الموقع...";
  $("cityName").textContent = "...";

  if (!navigator.geolocation) {
    $("locationText").textContent = "المتصفح لا يدعم الموقع الجغرافي";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      currentCoords = { lat, lon };
      await loadPrayerExperience(lat, lon);
    },
    (error) => {
      console.error("Geolocation error:", error);
      $("locationText").textContent = "تعذر تحديد الموقع. اسمح بالوصول للموقع.";
      $("cityName").textContent = "غير متاح";
      $("prayerTimes").innerHTML = `<div class="status-box">اسمح بالوصول للموقع لعرض الأوقات الصحيحة.</div>`;
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    }
  );
}

function normalizeHeading(event) {
  if (typeof event.webkitCompassHeading === "number") {
    return event.webkitCompassHeading;
  }

  if (typeof event.alpha === "number") {
    return 360 - event.alpha;
  }

  return null;
}

function updateCompass(heading) {
  if (heading == null || qiblaDirection == null) return;

  $("deviceHeading").textContent = `${Math.round(heading)}°`;

  const relative = qiblaDirection - heading;
  $("compassNeedle").style.transform = `translate(-50%, -50%) rotate(${relative}deg)`;
  $("qiblaMarker").style.transform = `translate(-50%, -50%) rotate(${qiblaDirection}deg)`;
}

function startCompassListener() {
  window.addEventListener(
    "deviceorientation",
    (event) => {
      const heading = normalizeHeading(event);
      if (heading == null) {
        $("qiblaStatus").textContent = "تعذر قراءة اتجاه الهاتف.";
        return;
      }

      $("qiblaStatus").textContent = "البوصلة شغالة. حرك الهاتف ببطء.";
      updateCompass(heading);
    },
    true
  );
}

async function startCompass() {
  if (qiblaDirection == null) {
    $("qiblaStatus").textContent = "حدد موقعك أولاً لتحميل اتجاه القبلة.";
    return;
  }

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        $("qiblaStatus").textContent = "لم يتم السماح باستخدام البوصلة.";
        return;
      }
    } catch (error) {
      console.error(error);
      $("qiblaStatus").textContent = "تعذر تشغيل البوصلة.";
      return;
    }
  }

  startCompassListener();
}

document.addEventListener("DOMContentLoaded", () => {
  locateUser();

  $("enableNotificationsBtn")?.addEventListener("click", requestNotificationPermission);
  $("refreshLocationBtn")?.addEventListener("click", locateUser);
  $("startCompassBtn")?.addEventListener("click", startCompass);
});
