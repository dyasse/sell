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
let isAudioEnabled = false; // متغير للتحقق من إذن الصوت
const adhanAudio = new Audio('https://www.islamcan.com/common/audio/adhan/turkey.mp3'); 

const salatTimesContainer = document.getElementById('salatTimesContainer');
const cityNameEl = document.getElementById('cityName');
const nextSalatText = document.getElementById('nextSalatText');

// 1. تحديد موقع المستخدم وجلب الأوقات
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
        cityNameEl.textContent = "الرباط (افتراضي)";
        fetchSalatTimes(34.020882, -6.841650);
      }
    );
  }
}

async function getCityName(lat, lon) {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`);
    const data = await res.json();
    cityNameEl.textContent = data.city || data.locality || "موقعك الحالي";
  } catch (error) { console.error(error); }
}

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
    salatTimesContainer.innerHTML = "<p>تعذر تحميل أوقات الصلاة</p>";
  }
}

// 2. عرض الأوقات في البطاقات
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

// 3. زر تفعيل الصوت (حل مشكلة Chrome)
function createAudioActivationBtn() {
  if (document.getElementById('enableAudioBtn')) return;
  
  const btn = document.createElement('button');
  btn.id = 'enableAudioBtn';
  btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> تفعيل صوت الأذان';
  btn.style = "background:#3b82f6; color:white; border:none; padding:10px 20px; border-radius:12px; cursor:pointer; font-family:Cairo; font-weight:bold; margin-bottom:20px; display:block; margin-inline:auto;";
  
  btn.onclick = () => {
    isAudioEnabled = true;
    // تشغيل وإيقاف الصوت لحظياً لكسر حاجز المتصفح
    adhanAudio.play().then(() => {
      adhanAudio.pause();
      adhanAudio.currentTime = 0;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> تم تفعيل الصوت';
      btn.style.background = "#10b981";
      setTimeout(() => btn.remove(), 3000); // إخفاء الزر بعد النجاح
    }).catch(err => console.log("خطأ في التفعيل"));
  };
  
  const header = document.querySelector('.hero-section');
  header.appendChild(btn);
}

// 4. مراقب الوقت
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

// 5. تشغيل الأذان
function triggerAdhan(prayerName) {
  const nameAr = salatNamesAr[prayerName];
  
  // إشعار
  if (Notification.permission === "granted") {
    new Notification(`وقت صلاة ${nameAr}`, {
      body: `حان الآن موعد الأذان حسب توقيتك المحلي.`,
      icon: "https://cdn-icons-png.flaticon.com/512/3208/3208035.png"
    });
  }

  // تشغيل الصوت إذا تم تفعيله
  if (isAudioEnabled) {
    adhanAudio.play().catch(e => console.log("الصوت محجوب"));
  }

  const stopBox = document.createElement("div");
  stopBox.id = "adhanStopBox";
  stopBox.style = "position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#1e293b; color:white; padding:20px; border-radius:20px; z-index:10000; text-align:center; min-width:250px;";
  stopBox.innerHTML = `
    <p style="margin-bottom:10px;">📢 أذان صلاة ${nameAr}...</p>
    <button onclick="stopAdhan()" style="background:#ef4444; color:white; border:none; padding:8px 20px; border-radius:10px; cursor:pointer;">إيقاف</button>
  `;
  document.body.appendChild(stopBox);
}

window.stopAdhan = function() {
  adhanAudio.pause();
  adhanAudio.currentTime = 0;
  const box = document.getElementById("adhanStopBox");
  if(box) box.remove();
};

document.addEventListener("DOMContentLoaded", () => {
  getUserLocation();
  createAudioActivationBtn(); // إظهار زر التفعيل عند التحميل
  if (Notification.permission !== "granted") Notification.requestPermission();
});
