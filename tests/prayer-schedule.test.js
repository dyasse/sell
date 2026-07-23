const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildFutureAlarms,
  buildNotificationId,
  cleanTime,
  parsePrayerDate,
  toDateKey,
} = require("../src/prayer-schedule.js");

const prayerNames = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

test("cleanTime removes API suffixes and rejects invalid values", () => {
  assert.equal(cleanTime("05:42 (+01)"), "05:42");
  assert.equal(cleanTime("7:03"), "07:03");
  assert.equal(cleanTime("25:00"), null);
});

test("parsePrayerDate builds a local date from the requested calendar day", () => {
  const date = parsePrayerDate("2026-07-23", "13:40");
  assert.equal(toDateKey(date), "2026-07-23");
  assert.equal(date.getHours(), 13);
  assert.equal(date.getMinutes(), 40);
});

test("future schedule never includes prayer times that already passed", () => {
  const now = new Date(2026, 6, 23, 16, 0, 0);
  const alarms = buildFutureAlarms([
    {
      dateKey: "2026-07-23",
      times: { Fajr: "05:00", Dhuhr: "13:30", Asr: "17:10", Maghrib: "20:30", Isha: "22:00" },
    },
    {
      dateKey: "2026-07-24",
      times: { Fajr: "05:01", Dhuhr: "13:30", Asr: "17:09", Maghrib: "20:29", Isha: "21:59" },
    },
  ], { now, city: "الرباط", prayerNames });

  assert.equal(alarms.length, 8);
  assert.equal(alarms[0].prayerKey, "Asr");
  assert.equal(alarms[0].dateKey, "2026-07-23");
  assert.equal(alarms.at(-1).prayerKey, "Isha");
  assert.ok(alarms.every((alarm) => alarm.at > now.getTime()));
});

test("notification ids remain unique per day and prayer", () => {
  const date = new Date(2026, 6, 23, 5, 0, 0);
  assert.notEqual(buildNotificationId(date, 1), buildNotificationId(date, 2));
  const tomorrow = new Date(2026, 6, 24, 5, 0, 0);
  assert.notEqual(buildNotificationId(date, 1), buildNotificationId(tomorrow, 1));
});
