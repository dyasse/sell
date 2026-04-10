# 🌙 تطبيق نور (Nour App)
**تطبيق إسلامي متكامل للقرآن الكريم، الأذكار، ومواقيت الصلاة.**

تطبيق "نور" هو رفيقك اليومي للتقرب من الله، مصمم بواجهة عصرية وسهلة الاستخدام تدعم الوضع الليلي وتعمل بدون إنترنت (PWA).

---

## ✨ المميزات الرئيسية
- 📖 القرآن الكريم بخط واضح وفهرس منظم.
- 🔖 حفظ موضع القراءة تلقائياً.
- 📜 عرض تفسير الآيات.
- ☀️ أذكار الصباح والمساء مع عدّاد.
- 🕌 مواقيت الصلاة واتجاه القبلة.
- 🌙 وضع ليلي وتجربة مريحة.

---

## 🛠️ تشغيل المشروع محلياً
```bash
git clone https://github.com/votre-username/nour-app.git
cd nour-app
npm run build
```

الأمر `npm run build` كينتج مجلد `dist/` (هذا هو webDir المستعمل مع Capacitor).

---

## 📱 Android عبر Capacitor (Production-ready)
### 1) تثبيت الحزم
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 2) تهيئة Capacitor
```bash
npx cap init "Nour Quran" "com.dyasse.nourquran" --web-dir dist
```

> الإعداد موجود أيضاً داخل `capacitor.config.ts`.

### 3) إضافة Android platform
```bash
npx cap add android
```

### 4) عند كل تحديث للويب
```bash
npm run build
npm run verify:webdir
npx cap sync android
```

---

## 🚨 Troubleshooting
### Merge conflict فـ GitHub
إذا ظهر:
`This branch has conflicts that must be resolved`

- ادخل لصفحة PR
- اضغط **Resolve conflicts**
- حدف علامات:
  - `<<<<<<< HEAD`
  - `=======`
  - `>>>>>>> branch-name`
- ختار/دمج المحتوى الصحيح
- **Mark as resolved** ثم **Commit merge**

### Vercel deployment failed
غالباً كيوقع بسبب:
1) conflict مازال ما تصلحش
2) build ما تدارش

تحقق محلياً:
```bash
npm run build
npm run verify:webdir
```

إذا `dist/` موجود، فـ `webDir: 'dist'` صحيح.
