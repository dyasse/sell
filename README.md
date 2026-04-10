# 🌙 تطبيق نور (Nour App)

**تطبيق إسلامي متكامل للقرآن الكريم، الأذكار، ومواقيت الصلاة.**

تطبيق "نور" هو رفيقك اليومي للتقرب من الله، مصمم بواجهة عصرية وسهلة الاستخدام، يدعم الوضع الليلي ويعمل بدون إنترنت (PWA).

---

## ✨ المميزات الرئيسية (Features)

- **📖 القرآن الكريم:** تلاوة كاملة بخط عثماني واضح مع فهرس مرتب للسور.
- **🔖 علامة القراءة (Bookmark):** حفظ تلقائي لمكان التوقف مع إمكانية الرجوع السريع.
- **📜 التفسير الميسر:** عرض تفسير الآيات باللغة العربية.
- **☀️ أذكار الصباح والمساء:** عداد ذكي للأذكار مع تذكير يومي.
- **🕌 مواقيت الصلاة والقبلة:** تحديد دقيق لمواقيت الصلاة واتجاه القبلة.
- **📢 الأذان:** تنبيهات صوتية وإشعارات عند دخول وقت الصلاة.
- **🌙 الوضع الليلي (Dark Mode):** واجهة مريحة للعين.
- **📶 يعمل بدون إنترنت (Offline):** بفضل تقنية PWA.

---

## 🚀 التقنيات المستخدمة (Tech Stack)

- **HTML5 / CSS3**
- **JavaScript (Vanilla)**
- **Quran API**
- **Aladhan API**
- **Service Workers**
- **LocalStorage**

---

## 📸 معاينة التطبيق (Screenshots)

> يمكنك إضافة صور التطبيق هنا لاحقًا.

---

## 🛠️ التشغيل المحلي (Local Development)

```bash
git clone https://github.com/dyasse/sell.git
cd sell
npm install
npm run build:web
```

---

## ▲ Vercel Web Deploy

- Vercel deploys **web only** via `npm run build:web`.
- The build script creates `dist/` and excludes `android-webview/` and any Capacitor-specific files.
- No Android/Capacitor command runs during Vercel build.

---

## 🤖 Android (Local only)

Use these commands only on your local machine with Android Studio:

```bash
npm run cap:sync
npm run android:open
# or
npm run android
```
