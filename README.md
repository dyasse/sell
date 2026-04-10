# 🌙 تطبيق نور (Nour App) 
**تطبيق إسلامي متكامل للقرآن الكريم، الأذكار، ومواقيت الصلاة.**

تطبيق "نور" هو رفيقك اليومي للتقرب من الله، مصمم بواجهة عصرية وسهلة الاستخدام تدعم الوضع الليلي وتعمل بدون إنترنت (PWA).

---

## ✨ المميزات الرئيسية (Features)
* **📖 القرآن الكريم:** تلاوة كاملة بخط عثماني واضح مع فهرس مرتب للسور.
* **🔖 علامة القراءة (Bookmark):** حفظ آلي لمكان توقفك مع خاصية الانتقال المباشر للآية (Auto-Scroll).
* **📜 التفسير الميسر:** عرض تفسير الآيات باللغة العربية بمجرد الضغط عليها.
* **☀️ أذكار الصباح والمساء:** عداد ذكي للأذكار مع تذكير يومي عبر الإشعارات.
* **🕌 مواقيت الصلاة والقبلة:** تحديد دقيق لمواقيت الصلاة بناءً على موقعك مع بوصلة لتحديد اتجاه القبلة.
* **📢 الأذان:** تنبيهات صوتية وإشعارات عند دخول وقت الصلاة مع إمكانية الإيقاف.
* **🌙 الوضع الليلي (Dark Mode):** واجهة مريحة للعين للقراءة في الأماكن المظلمة.
* **📶 يعمل بدون إنترنت (Offline):** بفضل تقنية PWA، يمكنك تصفح الأذكار والقرآن حتى بدون اتصال.

---

## 🚀 التقنيات المستخدمة (Tech Stack)
* **HTML5 / CSS3:** للتصميم وهيكلة الصفحات.
* **JavaScript (Vanilla):** للمنطق البرمجي والتفاعل.
* **Quran API:** لجلب الآيات والتفاسير والصوتيات.
* **Aladhan API:** لجلب مواقيت الصلاة بدقة.
* **Service Workers:** لتفعيل خاصية العمل بدون اتصال (PWA).
* **LocalStorage:** لحفظ علامات القراءة وتفضيلات المستخدم.

---

## 📸 معاينة التطبيق (Screenshots)
> *يمكنك إضافة صور للتطبيق هنا لاحقاً*
> ![Home Page](https://via.placeholder.com/400x200?text=Nour+App+Home)

---

## 🛠️ كيف تبدأ (Installation)
إذا كنت ترغب في تشغيل المشروع محلياً:
1. قم بتحميل المستودع (Clone):
   ```bash
   git clone [https://github.com/votre-username/nour-app.git](https://github.com/votre-username/nour-app.git)

---

## 📱 Android (Capacitor)

باش تخرّج نسخة Android production بطريقة مستقرة، كنستعملو Capacitor مع web build محلي (ماشي URL خارجي).

### 1) Build ديال الويب

```bash
npm run build
```

هاد الأمر كينتج مجلد `dist/` من ملفات المشروع الجاهزة للنسخ داخل Android app.

### 2) تثبيت Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 3) تهيئة Capacitor

```bash
npx cap init "Nour Quran" "com.dyasse.nourquran" --web-dir dist
```

المشروع فيه إعداد جاهز فـ `capacitor.config.ts` بنفس القيم الأساسية (`appId`, `appName`, `webDir`).

### 4) إضافة Android platform

```bash
npx cap add android
```

### 5) كل تحديث فالموقع

```bash
npm run build
npx cap sync android
```

`cap sync` كيدير copy ديال web assets + update ديال native dependencies مرة وحدة.
