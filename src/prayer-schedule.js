(function attachPrayerSchedule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.NourPrayerSchedule = api;
})(typeof window !== "undefined" ? window : globalThis, function createPrayerSchedule() {
  const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function cleanTime(value) {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return `${pad(hours)}:${pad(minutes)}`;
  }

  function parsePrayerDate(dateKey, timeValue) {
    const clean = cleanTime(timeValue);
    const dateMatch = String(dateKey || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!clean || !dateMatch) return null;

    const [hours, minutes] = clean.split(":").map(Number);
    const date = new Date(
      Number(dateMatch[1]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[3]),
      hours,
      minutes,
      0,
      0
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const timezoneDelta = (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60_000;
    return Math.floor((date - start + timezoneDelta) / 86_400_000);
  }

  function buildNotificationId(date, prayerIndex) {
    return (date.getFullYear() * 10_000) + (getDayOfYear(date) * 10) + prayerIndex;
  }

  function buildFutureAlarms(dayEntries, options = {}) {
    const now = options.now instanceof Date ? options.now : new Date();
    const city = String(options.city || "").trim();
    const prayerNames = options.prayerNames || {};
    const earliestAllowed = now.getTime() + 5_000;
    const seen = new Set();
    const alarms = [];

    for (const entry of Array.isArray(dayEntries) ? dayEntries : []) {
      if (!entry || !entry.dateKey || !entry.times) continue;

      PRAYER_ORDER.forEach((key, index) => {
        const date = parsePrayerDate(entry.dateKey, entry.times[key]);
        if (!date || date.getTime() <= earliestAllowed) return;

        const id = buildNotificationId(date, index + 1);
        if (seen.has(id)) return;
        seen.add(id);

        const label = prayerNames[key] || key;
        alarms.push({
          id,
          at: date.getTime(),
          title: `حان الآن وقت صلاة ${label}`,
          body: city ? `المدينة: ${city}` : "تطبيق نور يذكرك بموعد الصلاة.",
          prayerKey: key,
          dateKey: entry.dateKey,
        });
      });
    }

    return alarms.sort((first, second) => first.at - second.at);
  }

  return {
    PRAYER_ORDER,
    buildFutureAlarms,
    buildNotificationId,
    cleanTime,
    parsePrayerDate,
    toDateKey,
  };
});
