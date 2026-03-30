// الأسماء العربية للصلوات
const salatNamesAr = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء"
};

let prayerTimes = {};
const adhanAudio = new Audio('https://www.islamcan.com/common/audio/adhan/turkey.mp3'); 

const salatTimesContainer = document.getElementById('salatTimesContainer');
const cityNameEl = document.getElementById('cityName');
const nextSalatText = document.getElementById('nextSalatText');

// 1. تحديد موقع المستخدم
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
        fetchSalatTimes(34.020882, -6.841650);
      }
    );
  }
}

// 2. جلب اسم المدينة
async function getCityName(lat, lon) {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`);
    const data = await res.json();
    cityNameEl.textContent = data.city || data.locality || "موقعك الحالي";
  } catch (error) { console.error(error); }
}

// 3. جلب أوقات الصلاة
async function fetchSalatTimes(lat, lon) {
  try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lon}&method=3`);
    const data = await res.json();
    
    if(data.code === 200) {
      prayerTimes = data.data.timings;
      displaySalatTimes(prayerTimes);
    }
  } catch (error) {
    salatTimesContainer.innerHTML = "<p>وقع مشكل في تحميل الأوقات</p>";
  }
}

// 4. عرض الأوقات وتفعيل مراقب الأذان
function displaySalatTimes(timings) {
  salatTimesContainer.innerHTML = '';
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  let nextSalat = null;
  let minDiff = Infinity;
  const prayersToShow = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  prayersToShow.forEach(prayer => {
    const timeStr = timings[prayer];
    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayerTimeMins = hours * 60 + minutes;

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

  if (nextSalat) {
    nextSalatText.innerHTML = `الصلاة القادمة هي <strong>${salatNamesAr[nextSalat]}</strong>`;
  }

  startAdhanMonitor();
}

// 5. مراقب الأذان
function startAdhanMonitor() {
  setInterval(() => {
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    prayers.forEach(prayer => {
      if (prayerTimes[prayer] === currentHM && now.getSeconds() === 0) {
        triggerAdhan(prayer);
      }
    });
  }, 1000);
}

// 6. تشغيل الأذان وتنبيه المستخدم
function triggerAdhan(prayerName) {
  const nameAr = salatNamesAr[prayerName];
  
  // إشعار المتصفح
  if (Notification.permission === "granted") {
    new Notification(`حان الآن وقت صلاة ${nameAr}`, {
      body: `الله أكبر، الله أكبر. وقت صلاة ${nameAr} حسب توقيتك المحلي.`,
      icon: "https://cdn-icons-png.flaticon.com/512/3208/3208035.png"
    });
  }

  // تشغيل الصوت
  adhanAudio.play().catch(e => console.log("User interaction required for audio"));

  // إظهار زر الإيقاف والرسالة
  const stopBox = document.createElement("div");
  stopBox.id = "adhanStopBox";
  stopBox.style = "position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#1e293b; color:white; padding:20px 40px; border-radius:20px; z-index:10000; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5); font-family:Cairo;";
  stopBox.innerHTML = `
    <p style="margin-bottom:15px; font-weight:bold;">📢 أذان صلاة ${nameAr} كاين دابا...</p>
    <button onclick="stopAdhan()" style="background:#ef4444; color:white; border:none; padding:10px 25px; border-radius:12px; cursor:pointer; font-weight:bold; font-family:Cairo;">إيقاف الأذان</button>
  `;
  document.body.appendChild(stopBox);
}

// 7. إيقاف الأذان
window.stopAdhan = function() {
  adhanAudio.pause();
  adhanAudio.currentTime = 0;
  const stopBox = document.getElementById("adhanStopBox");
  if(stopBox) stopBox.remove();
};

// ==========================================
// قسم القبلة (Qibla Compass)
// ==========================================
let qiblaAngle = 100; 
const needle = document.getElementById('compassNeedle');
const statusText = document.getElementById('qiblaStatus');

window.startCompass = function() {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(state => {
      if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation);
    });
  } else {
    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);
  }
};

function handleOrientation(event) {
  let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
  if (compass) {
    let needleRotation = qiblaAngle - compass;
    needle.style.transform = `rotate(${needleRotation}deg)`;
    needle.style.background = (Math.abs(needleRotation) < 5 || Math.abs(needleRotation) > 355) ? "#10b981" : "#ef4444";
  }
}

// ==========================================
// المظهر والتشغيل
// ==========================================
function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  getUserLocation();
  if (Notification.permission !== "granted") Notification.requestPermission();
});
