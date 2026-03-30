if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker خدام بنجاح!'))
      .catch(err => console.log('وقع مشكل في الـ Service Worker', err));
  });
}
// الأسماء العربية للصلوات
const salatNamesAr = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء"
};

const salatTimesContainer = document.getElementById('salatTimesContainer');
const cityNameEl = document.getElementById('cityName');
const nextSalatText = document.getElementById('nextSalatText');

// 1. تحديد موقع المستخدم (Geolocation)
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchSalatTimes(lat, lon);
        getCityName(lat, lon);
      },
      (error) => {
        console.error("Error getting location:", error);
        cityNameEl.textContent = "الرباط (افتراضي)";
        fetchSalatTimes(34.020882, -6.841650); // افتراضيا الرباط يلا ماعطاش الصلاحية
      }
    );
  } else {
    cityNameEl.textContent = "الموقع غير مدعوم";
  }
}

// 2. جلب اسم المدينة من الإحداثيات (Reverse Geocoding)
async function getCityName(lat, lon) {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`);
    const data = await res.json();
    cityNameEl.textContent = data.city || data.locality || "موقعك الحالي";
  } catch (error) {
    console.error("City name fetch error:", error);
  }
}

// 3. جلب أوقات الصلاة من API Aladhan
async function fetchSalatTimes(lat, lon) {
  try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lon}&method=3`);
    const data = await res.json();
    
    if(data.code === 200) {
      displaySalatTimes(data.data.timings);
    }
  } catch (error) {
    console.error("Salat API error:", error);
    salatTimesContainer.innerHTML = "<p>وقع مشكل في تحميل الأوقات</p>";
  }
}

// 4. عرض الأوقات في البطاقات وتحديد الصلاة القادمة
function displaySalatTimes(timings) {
  salatTimesContainer.innerHTML = '';
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // الوقت الحالي بالدقائق
  
  let nextSalat = null;
  let minDiff = Infinity;

  const prayersToShow = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  prayersToShow.forEach(prayer => {
    const timeStr = timings[prayer];
    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayerTimeMins = hours * 60 + minutes;

    // تحديد الصلاة القادمة
    if (prayerTimeMins > currentTime && (prayerTimeMins - currentTime) < minDiff && prayer !== 'Sunrise') {
      minDiff = prayerTimeMins - currentTime;
      nextSalat = prayer;
    }

    const isNext = (prayer === nextSalat);

    const card = document.createElement('div');
    card.className = `salat-card ${isNext ? 'next-salat' : ''}`;
    
    card.innerHTML = `
      <div class="salat-name">${salatNamesAr[prayer]}</div>
      <div class="salat-time">${timeStr}</div>
      ${isNext ? '<div style="color:#3b82f6; font-size:12px; font-weight:bold; margin-top:5px;">الصلاة القادمة</div>' : ''}
    `;
    
    salatTimesContainer.appendChild(card);
  });

  // إذا لم نجد صلاة قادمة (بعد العشاء)، فالصلاة القادمة هي الفجر
  if (!nextSalat) {
    nextSalat = 'Fajr';
    // تحديد بطاقة الفجر لتكون مميزة
    if(salatTimesContainer.firstChild) {
      salatTimesContainer.firstChild.classList.add('next-salat');
      salatTimesContainer.firstChild.innerHTML += '<div style="color:#3b82f6; font-size:12px; font-weight:bold; margin-top:5px;">الصلاة القادمة</div>';
    }
  }

  nextSalatText.innerHTML = `الصلاة القادمة هي <strong>${salatNamesAr[nextSalat]}</strong>`;
}

// ==========================================
// قسم القبلة (Qibla Compass)
// ==========================================
let qiblaAngle = 100; // زاوية القبلة التقريبية للمغرب (يمكن حسابها دقيقاً بناء على الإحداثيات لاحقاً)
const needle = document.getElementById('compassNeedle');
const statusText = document.getElementById('qiblaStatus');

function startCompass() {
  if (!window.DeviceOrientationEvent) {
    statusText.textContent = "جهازك لا يدعم البوصلة.";
    return;
  }

  // طلب الصلاحية للآيفون (iOS 13+)
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          statusText.textContent = "قم بتدوير الهاتف ليتطابق المؤشر الأحمر مع الكعبة.";
        } else {
          statusText.textContent = "يجب إعطاء الصلاحية للبوصلة.";
        }
      })
      .catch(console.error);
  } else {
    // هواتف أندرويد لا تحتاج طلب صلاحية صريح
    window.addEventListener('deviceorientationabsolute', handleOrientation); // للأندرويد
    window.addEventListener('deviceorientation', handleOrientation); // كبديل
    statusText.textContent = "قم بتدوير الهاتف ليتطابق المؤشر الأحمر مع الكعبة.";
  }
}

function handleOrientation(event) {
  let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
  
  if (compass) {
    // حساب الزاوية لتدوير الإبرة لتشير إلى القبلة
    let needleRotation = qiblaAngle - compass;
    needle.style.transform = `rotate(${needleRotation}deg)`;
    
    // إذا كان الهاتف موجهاً للقبلة تماماً (بهامش خطأ 5 درجات)
    if(Math.abs(needleRotation) < 5 || Math.abs(needleRotation) > 355) {
      needle.style.background = "linear-gradient(to bottom, #10b981 50%, #94a3b8 50%)"; // أخضر
    } else {
      needle.style.background = "linear-gradient(to bottom, #ef4444 50%, #94a3b8 50%)"; // أحمر
    }
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

// تشغيل الوظائف عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  getUserLocation();
});
