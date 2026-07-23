const prayerNames = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const prayerSchedule = window.NourPrayerSchedule;
const PRAYER_ORDER = prayerSchedule?.PRAYER_ORDER || ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_OFFSET_KEY = "nour_prayer_offset_minutes";
const PRAYER_SCHEDULE_DAYS = 30;
const SCHEDULE_REFRESH_MS = 30 * 60 * 1000;

let currentCoords = null;
let currentCity = "";
let prayerTimesToday = null;
let prayerTimesTomorrow = null;
let nextPrayerTimer = null;
let adhanCheckTimer = null;
let qiblaDirection = null;
let scheduleInFlight = null;
let lastScheduledDateKey = "";

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

function toDateKey(date) {
  if (prayerSchedule?.toDateKey) return prayerSchedule.toDateKey(date);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function cleanTime(value) {
  if (prayerSchedule?.cleanTime) return prayerSchedule.cleanTime(value);
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  return match ? `${pad(match[1])}:${match[2]}` : null;
}

function getPrayerOffset() {
  const saved = Number(localStorage.getItem(PRAYER_OFFSET_KEY) || 0);
  return Math.max(-60, Math.min(60, Number.isFinite(saved) ? Math.round(saved) : 0));
}

function applyPrayerOffset(times) {
  const offset = getPrayerOffset();
  const adjusted = {};

  for (const key of PRAYER_ORDER) {
    const time = cleanTime(times?.[key]);
    if (!time) continue;
    const [hours, minutes] = time.split(":").map(Number);
    const total = ((hours * 60) + minutes + offset + 1440) % 1440;
    adjusted[key] = `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
  }

  return adjusted;
}

function parseTimeToDate(timeString, referenceDate = new Date()) {
  const clean = cleanTime(timeString) || "00:00";
  const [hours, minutes] = clean.split(":").map(Number);
  const date = new Date(referenceDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getNextPrayerInfo(times) {
  const now = new Date();

  for (const key of PRAYER_ORDER) {
    const prayerDate = parseTimeToDate(times[key], now);
    if (prayerDate > now) return { key, label: prayerNames[key], date: prayerDate };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFajr = parseTimeToDate(prayerTimesTomorrow?.Fajr || times.Fajr, tomorrow);
  return { key: "Fajr", label: prayerNames.Fajr, date: tomorrowFajr };
}

function renderPrayerTimes(times) {
  const container = $("prayerTimes");
  if (!container) return;
  const nextInfo = getNextPrayerInfo(times);

  container.innerHTML = PRAYER_ORDER.map((key) => `
    <div class="prayer-card ${nextInfo.key === key ? "next-prayer-card" : ""}">
      <div class="prayer-card-icon"><i class="fa-regular fa-clock"></i></div>
      <div class="prayer-name">${prayerNames[key]}</div>
      <div class="prayer-time">${times[key]}</div>
      <div class="prayer-badge">${nextInfo.key === key ? "الصلاة القادمة" : "اليوم"}</div>
    </div>
  `).join("");
}

function updateNextPrayerUI() {
  if (!prayerTimesToday) return;
  const nextInfo = getNextPrayerInfo(prayerTimesToday);
  $("nextPrayerText").textContent = `الصلاة القادمة: ${nextInfo.label}`;
  $("countdownValue").textContent = formatRemaining(nextInfo.date - new Date());
  renderPrayerTimes(prayerTimesToday);
}

function startCountdown() {
  if (nextPrayerTimer) clearInterval(nextPrayerTimer);
  updateNextPrayerUI();
  nextPrayerTimer = setInterval(updateNextPrayerUI, 1000);
}

function getLocalNotificationsPlugin() {
  return window.Capacitor?.Plugins?.LocalNotifications || null;
}

function getPrayerAlarmPlugin() {
  return window.Capacitor?.Plugins?.PrayerAlarm || null;
}

function setNotificationStatus(message, type = "info") {
  const status = $("notificationStatus");
  if (!status) return;
  status.textContent = message;
  status.dataset.type = type;
}

async function cancelLegacyNotifications() {
  const localNotifications = getLocalNotificationsPlugin();
  if (!localNotifications?.getPending) return;
  const result = await localNotifications.getPending();
  const pending = Array.isArray(result?.notifications) ? result.notifications : [];
  if (pending.length) {
    await localNotifications.cancel({ notifications: pending.map(({ id }) => ({ id })) });
  }
}

function parseCalendarDate(value) {
  const match = String(value || "").match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

function pickTimings(timings) {
  const selected = {};
  for (const key of PRAYER_ORDER) selected[key] = timings?.[key];
  return applyPrayerOffset(selected);
}

async function fetchPrayerCalendarMonth(lat, lon, year, month) {
  const response = await fetch(
    `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&method=3`
  );
  if (!response.ok) throw new Error(`Prayer calendar API error ${response.status}`);
  const payload = await response.json();
  return (Array.isArray(payload?.data) ? payload.data : []).map((entry) => ({
    dateKey: parseCalendarDate(entry?.date?.gregorian?.date),
    times: pickTimings(entry?.timings),
  })).filter((entry) => entry.dateKey);
}

async function getPrayerCalendar(lat, lon, days = PRAYER_SCHEDULE_DAYS) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const lastDay = new Date(today);
  lastDay.setDate(lastDay.getDate() + days);

  const months = [];
  const cursor = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const endMonth = new Date(lastDay.getFullYear(), lastDay.getMonth(), 1, 12);
  while (cursor <= endMonth) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const entries = (await Promise.all(
    months.map(({ year, month }) => fetchPrayerCalendarMonth(lat, lon, year, month))
  )).flat();
  const firstKey = toDateKey(today);
  const lastKey = toDateKey(lastDay);
  return entries.filter(({ dateKey }) => dateKey >= firstKey && dateKey <= lastKey);
}

async function scheduleAdhanNotifications({ force = false, silent = false } = {}) {
  if (scheduleInFlight) return scheduleInFlight;

  scheduleInFlight = (async () => {
    const alarmPlugin = getPrayerAlarmPlugin();
    if (!alarmPlugin || !window.Capacitor?.isNativePlatform?.()) {
      if (!silent) alert("ميزة التنبيهات الدقيقة تعمل داخل تطبيق أندرويد فقط.");
      return false;
    }
    if (!currentCoords) {
      if (!silent) alert("حدد موقعك أولاً حتى نحسب المواقيت الصحيحة.");
      return false;
    }

    const todayKey = toDateKey(new Date());
    if (!force && lastScheduledDateKey === todayKey) return true;
    const exactAccess = await alarmPlugin.checkExactAlarmAccess();
    if (!exactAccess?.granted) {
      setNotificationStatus("يلزم السماح بالمنبّهات الدقيقة من إعدادات أندرويد.", "warning");
      if (!silent) await alarmPlugin.openExactAlarmSettings();
      return false;
    }

    const calendar = await getPrayerCalendar(currentCoords.lat, currentCoords.lon);
    const alarms = prayerSchedule?.buildFutureAlarms(calendar, {
      now: new Date(),
      city: currentCity,
      prayerNames,
    }) || [];
    if (!alarms.length) throw new Error("No future prayer alarms were generated");

    await cancelLegacyNotifications();
    const result = await alarmPlugin.scheduleBatch({ alarms });
    lastScheduledDateKey = todayKey;
    setNotificationStatus(`التنبيهات الدقيقة مفعّلة لـ ${result?.scheduled || alarms.length} موعداً قادماً.`, "success");
    return true;
  })().catch((error) => {
    console.error("Prayer alarm scheduling failed", error);
    setNotificationStatus("تعذر تحديث التنبيهات الآن. تحقق من الإنترنت وإعدادات أندرويد.", "error");
    if (!silent) alert("تعذر تفعيل التنبيهات حالياً.");
    return false;
  }).finally(() => {
    scheduleInFlight = null;
  });

  return scheduleInFlight;
}

async function requestNotificationPermission() {
  try {
    const localNotifications = getLocalNotificationsPlugin();
    if (!localNotifications) {
      alert("ميزة التنبيهات تعمل داخل تطبيق أندرويد فقط.");
      return;
    }

    const permission = await localNotifications.requestPermissions();
    if (permission.display !== "granted") {
      setNotificationStatus("الإشعارات غير مسموح بها من إعدادات الجهاز.", "warning");
      return;
    }

    const scheduled = await scheduleAdhanNotifications({ force: true });
    if (scheduled) alert("تم تفعيل تنبيهات الصلاة الدقيقة بنجاح.");
  } catch (error) {
    console.error("Notification permission failed", error);
    setNotificationStatus("تعذر تفعيل التنبيهات حالياً.", "error");
  }
}

function startAdhanWatcher() {
  if (adhanCheckTimer) clearInterval(adhanCheckTimer);

  getLocalNotificationsPlugin()?.checkPermissions?.().then((permission) => {
    if (permission?.display === "granted") scheduleAdhanNotifications({ silent: true });
  }).catch((error) => console.warn("Unable to refresh prayer alarms", error));

  adhanCheckTimer = setInterval(() => {
    if (lastScheduledDateKey !== toDateKey(new Date())) {
      scheduleAdhanNotifications({ force: true, silent: true });
    }
  }, SCHEDULE_REFRESH_MS);
}

async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`
    );
    const data = await response.json();
    return data.city || data.locality || data.principalSubdivision || "موقعك الحالي";
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return "موقعك الحالي";
  }
}

async function getPrayerTimesForDate(lat, lon, date) {
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${lat}&longitude=${lon}&method=3`
  );
  if (!response.ok) throw new Error(`Prayer API error ${response.status}`);
  const data = await response.json();
  return pickTimings(data?.data?.timings);
}

async function getQiblaDirection(lat, lon) {
  const response = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`);
  if (!response.ok) throw new Error(`Qibla API error ${response.status}`);
  const data = await response.json();
  return Number(data?.data?.direction || 0);
}

async function loadPrayerExperience(lat, lon) {
  $("prayerTimes").innerHTML = `<div class="status-box">جاري تحميل أوقات الصلاة...</div>`;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const [city, todayTimes, tomorrowTimes, qibla] = await Promise.all([
      reverseGeocode(lat, lon),
      getPrayerTimesForDate(lat, lon, today),
      getPrayerTimesForDate(lat, lon, tomorrow),
      getQiblaDirection(lat, lon),
    ]);

    currentCity = city;
    prayerTimesToday = todayTimes;
    prayerTimesTomorrow = tomorrowTimes;
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
      currentCoords = { lat: position.coords.latitude, lon: position.coords.longitude };
      await loadPrayerExperience(currentCoords.lat, currentCoords.lon);
    },
    (error) => {
      console.error("Geolocation error:", error);
      $("locationText").textContent = "تعذر تحديد الموقع. اسمح بالوصول للموقع.";
      $("cityName").textContent = "غير متاح";
      $("prayerTimes").innerHTML = `<div class="status-box">اسمح بالوصول للموقع لعرض الأوقات الصحيحة.</div>`;
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

function normalizeHeading(event) {
  if (typeof event.webkitCompassHeading === "number") return event.webkitCompassHeading;
  if (typeof event.alpha === "number") return 360 - event.alpha;
  return null;
}

function updateCompass(heading) {
  if (heading == null || qiblaDirection == null) return;
  $("deviceHeading").textContent = `${Math.round(heading)}°`;
  $("compassNeedle").style.transform = `translate(-50%, -50%) rotate(${qiblaDirection - heading}deg)`;
  $("qiblaMarker").style.transform = `translate(-50%, -50%) rotate(${qiblaDirection}deg)`;
}

function startCompassListener() {
  window.addEventListener("deviceorientation", (event) => {
    const heading = normalizeHeading(event);
    if (heading == null) {
      $("qiblaStatus").textContent = "تعذر قراءة اتجاه الهاتف.";
      return;
    }
    $("qiblaStatus").textContent = "البوصلة شغالة. حرك الهاتف ببطء.";
    updateCompass(heading);
  }, true);
}

async function startCompass() {
  if (qiblaDirection == null) {
    $("qiblaStatus").textContent = "حدد موقعك أولاً لتحميل اتجاه القبلة.";
    return;
  }
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      if (await DeviceOrientationEvent.requestPermission() !== "granted") {
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

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  getLocalNotificationsPlugin()?.checkPermissions?.().then((permission) => {
    if (permission?.display === "granted") scheduleAdhanNotifications({ force: true, silent: true });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  locateUser();
  $("enableNotificationsBtn")?.addEventListener("click", requestNotificationPermission);
  $("refreshLocationBtn")?.addEventListener("click", locateUser);
  $("startCompassBtn")?.addEventListener("click", startCompass);
});
