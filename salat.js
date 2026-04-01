const prayerNames = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء"
};

function renderPrayerTimes(times) {
  const container = document.getElementById("prayerTimes");

  container.innerHTML = Object.keys(prayerNames)
    .map((key) => {
      return `
        <div class="prayer-card">
          <div class="prayer-name">${prayerNames[key]}</div>
          <div class="prayer-time">${times[key]}</div>
        </div>
      `;
    })
    .join("");
}

function loadPrayerTimes(lat, lon) {
  fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`)
    .then(res => res.json())
    .then(data => {
      const timings = data.data.timings;

      renderPrayerTimes({
        Fajr: timings.Fajr,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha
      });
    })
    .catch(() => {
      document.getElementById("prayerTimes").innerHTML =
        `<div class="status-box">تعذر تحميل الأوقات</div>`;
    });
}

function getLocation() {
  const locationText = document.getElementById("locationText");

  if (!navigator.geolocation) {
    locationText.textContent = "الموقع غير مدعوم";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      locationText.textContent = "تم تحديد موقعك";

      loadPrayerTimes(lat, lon);
    },
    () => {
      locationText.textContent = "تعذر تحديد الموقع";
    }
  );
}

function getQibla() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("qiblaResult").innerHTML =
          `اتجاه القبلة: ${Math.round(data.data.direction)}°`;
      });
  });
}

document.addEventListener("DOMContentLoaded", getLocation);
