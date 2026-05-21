(function () {
  const LANG_KEY = "nour_ui_language";
  const SUPPORTED_LANGUAGES = ["ar", "en", "fr"];

  const translations = {
    ar: {
      "settings.title": "الإعدادات",
      "settings.closeAria": "إغلاق الإعدادات",
      "settings.darkMode": "الوضع الليلي",
      "settings.prayerOffset": "تعديل مواقيت الصلاة",
      "settings.language": "اللغة",
      "settings.share": "مشاركة التطبيق",
      "settings.signIn": "تسجيل الدخول",
      "nav.homeAria": "العودة للرئيسية",
      "nav.settingsAria": "فتح الإعدادات",
      "hero.badge": "تطبيق إسلامي بسيط ومريح",
      "hero.subtitle": "رفيقك اليومي للقرآن والأذكار والأدعية ومواقيت الصلاة",
      "hero.install": "تثبيت التطبيق على الهاتف",
      "seo.kicker": "منصة قرآنية مجانية",
      "seo.title": "اقرأوا واستمعوا وعيشوا مع القرآن يومياً",
      "seo.description": "مرحباً بكم في نور القرآن، منصتكم الشاملة والمجانية لقراءة والاستماع للقرآن الكريم. استمتعوا بواجهة سلسة مع التمرير التلقائي، مواقيت الصلاة الدقيقة، وبوصلة القبلة المدمجة. تجربة روحانية محسّنة لجميع الأجهزة، بدون انقطاع.",
      "seo.featuresAria": "الميزات الرئيسية",
      "seo.feature.read": "قراءة القرآن",
      "seo.feature.listen": "الاستماع الصوتي",
      "seo.feature.prayer": "الصلاة والقبلة",
      "bookmark.label": "واصل القراءة من",
      "apps.quran.title": "القرآن الكريم",
      "apps.quran.desc": "قراءة وتفسير السور",
      "apps.adhkar.title": "الأذكار",
      "apps.adhkar.desc": "حصن المسلم اليومي",
      "apps.duas.title": "الأدعية",
      "apps.duas.desc": "أدعية مختارة جامعة",
      "apps.favorites.title": "المفضلة",
      "apps.favorites.desc": "العناصر المحفوظة",
      "apps.salat.title": "الصلاة",
      "apps.salat.desc": "المواقيت والقبلة",
      "apps.support.title": "ادعمنا",
      "apps.support.desc": "ساهم في استمرار المشروع",
      "footer.aria": "روابط قانونية ومعلومات",
      "footer.privacy": "سياسة الخصوصية",
      "footer.about": "من نحن",
      "footer.contact": "تواصل معنا",
      "footer.terms": "الشروط",
      "cookie.aria": "إشعار الموافقة على ملفات تعريف الارتباط",
      "cookie.title": "ملفات تعريف الارتباط والخصوصية",
      "cookie.message": "نحن نستخدم ملفات تعريف الارتباط (الكوكيز) لتخصيص المحتوى، تقديم إعلانات مناسبة، وتحليل حركة الزيارات. باستمرارك في تصفح الموقع، فإنك توافق على سياستنا.",
      "cookie.accept": "موافق",
      "legal.backHome": "الرجوع للصفحة الرئيسية",
      "about.metaTitle": "من نحن | نور القرآن",
      "about.badge": "من نحن",
      "about.title": "من نحن",
      "about.body": "نور القرآن منصة رقمية مجانية تهدف إلى تقديم القرآن الكريم والأذكار والأدعية ومواقيت الصلاة وبوصلة القبلة في تجربة سهلة وسريعة على الويب والجوال.",
      "contact.metaTitle": "تواصل معنا | نور القرآن",
      "contact.badge": "تواصل معنا",
      "contact.title": "تواصل معنا",
      "contact.body": "راسلنا لأي ملاحظات أو اقتراحات أو طلبات متعلقة بسياسة الخصوصية عبر البريد الإلكتروني: support@nour-quran.com",
      "privacy.metaTitle": "سياسة الخصوصية | نور القرآن",
      "privacy.badge": "سياسة الخصوصية",
      "privacy.title": "سياسة الخصوصية - نور القرآن",
      "privacy.subtitle": "تاريخ السريان: 11 أبريل 2026. توضح هذه السياسة كيف يجمع نور القرآن معلومات المستخدمين ويستخدمها ويحميها.",
      "privacy.collectTitle": "1. المعلومات التي نجمعها",
      "privacy.collectBody": "نجمع فقط البيانات اللازمة لتقديم ميزات التطبيق الأساسية وتحسين أدائه.",
      "privacy.location": "بيانات الموقع: تُستخدم لتقديم مواقيت صلاة دقيقة وتحديد اتجاه القبلة.",
      "privacy.storage": "الوصول إلى التخزين: يُستخدم لحفظ التفضيلات وتشغيل ملفات تلاوة القرآن عند توفرها.",
      "privacy.useTitle": "2. كيف نستخدم بياناتك",
      "privacy.useOne": "تفعيل الميزات الإسلامية المعتمدة على الموقع، مثل مواقيت الصلاة والقبلة.",
      "privacy.useTwo": "حفظ التفضيلات مثل اللغة والمظهر وموافقة ملفات تعريف الارتباط.",
      "privacy.useThree": "متابعة استقرار التطبيق واتجاهات الاستخدام وتحسين تجربة المستخدم.",
      "privacy.thirdTitle": "3. خدمات الطرف الثالث",
      "privacy.thirdBody": "قد يستخدم نور القرآن أدوات موثوقة من أطراف ثالثة تعالج بيانات محدودة وفق سياسات الخصوصية الخاصة بها:",
      "privacy.google": "خدمات Google الإعلانية لعرض الإعلانات وقياس الأداء.",
      "privacy.supabase": "Supabase للمصادقة وإدارة الجلسات عند استخدام تسجيل الدخول.",
      "privacy.analytics": "أدوات التحليلات لمراقبة الاستخدام وتحسين الخدمة.",
      "privacy.thirdNote": "قد تجمع هذه الخدمات معرفات الجهاز أو بيانات تشخيصية أو مقاييس تفاعل لازمة لتشغيل خدماتها.",
      "privacy.childrenTitle": "4. خصوصية الأطفال",
      "privacy.childrenBody": "لا يجمع نور القرآن عن علم معلومات شخصية من الأطفال دون سن 13 عاماً. إذا كنت ولي أمر وتعتقد أن طفلك قدم بيانات شخصية، يرجى التواصل معنا لاتخاذ الإجراء المناسب.",
      "privacy.deletionTitle": "5. طلبات حذف البيانات",
      "privacy.deletionBody": "يمكنك طلب حذف البيانات المرتبطة باستخدامك للتطبيق عبر التواصل معنا على البريد الإلكتروني أدناه مع معلومات كافية لمساعدتنا على تحديد الطلب ومعالجته خلال مدة معقولة.",
      "privacy.securityTitle": "6. أمن البيانات",
      "privacy.securityBody": "نطبق تدابير تقنية وتنظيمية معقولة لحماية المعلومات من الوصول أو الإفصاح أو التعديل أو الإتلاف غير المصرح به.",
      "privacy.updatesTitle": "7. تحديثات هذه السياسة",
      "privacy.updatesBody": "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر، وسيتم نشر أي تحديثات على هذه الصفحة مع تاريخ سريان محدث.",
      "privacy.supportTitle": "الدعم والتواصل",
      "privacy.supportBody": "إذا كانت لديك أسئلة أو مخاوف أو طلبات متعلقة بسياسة الخصوصية، يرجى التواصل معنا:",
      "privacy.footerNote": "باستخدامك نور القرآن، فإنك تقر بأنك قرأت وفهمت سياسة الخصوصية هذه."
    },
    en: {
      "settings.title": "Settings",
      "settings.closeAria": "Close settings",
      "settings.darkMode": "Dark Mode",
      "settings.prayerOffset": "Adjust Prayer Times",
      "settings.language": "Language",
      "settings.share": "Share App",
      "settings.signIn": "Sign In",
      "nav.homeAria": "Back to home",
      "nav.settingsAria": "Open settings",
      "hero.badge": "A simple and comfortable Islamic app",
      "hero.subtitle": "Your daily companion for Quran, adhkar, duas, and prayer times",
      "hero.install": "Install the app on your phone",
      "seo.kicker": "Free Quran Platform",
      "seo.title": "Read, listen, and live with the Quran daily",
      "seo.description": "Welcome to Nour Quran, your comprehensive and free platform for reading and listening to the Holy Quran. Enjoy a smooth interface with auto-scroll, accurate prayer times, and a built-in Qibla compass. An optimized spiritual experience for all devices, without interruption.",
      "seo.featuresAria": "Main features",
      "seo.feature.read": "Quran reading",
      "seo.feature.listen": "Audio listening",
      "seo.feature.prayer": "Prayer & Qibla",
      "bookmark.label": "Continue reading from",
      "apps.quran.title": "Holy Quran",
      "apps.quran.desc": "Read and explore surahs",
      "apps.adhkar.title": "Adhkar",
      "apps.adhkar.desc": "Daily Muslim fortress",
      "apps.duas.title": "Duas",
      "apps.duas.desc": "Selected comprehensive supplications",
      "apps.favorites.title": "Favorites",
      "apps.favorites.desc": "Saved items",
      "apps.salat.title": "Prayer",
      "apps.salat.desc": "Times and Qibla",
      "apps.support.title": "Support Us",
      "apps.support.desc": "Help keep the project running",
      "footer.aria": "Legal and information links",
      "footer.privacy": "Privacy Policy",
      "footer.about": "About",
      "footer.contact": "Contact",
      "footer.terms": "Terms",
      "cookie.aria": "Cookie consent notice",
      "cookie.title": "Cookies & Privacy",
      "cookie.message": "We use cookies to personalize content, provide relevant ads, and analyze our traffic. By continuing to browse, you agree to our policy.",
      "cookie.accept": "Accept",
      "legal.backHome": "Back to home",
      "about.metaTitle": "About | Nour Quran",
      "about.badge": "About",
      "about.title": "About Nour Quran",
      "about.body": "Nour Quran is a free digital platform designed to provide the Holy Quran, adhkar, duas, prayer times, and a Qibla compass in a smooth and fast experience across web and mobile.",
      "contact.metaTitle": "Contact | Nour Quran",
      "contact.badge": "Contact",
      "contact.title": "Contact Us",
      "contact.body": "Send us feedback, suggestions, or privacy-related requests by email: support@nour-quran.com",
      "privacy.metaTitle": "Privacy Policy | Nour Quran",
      "privacy.badge": "Privacy Policy",
      "privacy.title": "Nour Quran - Privacy Policy",
      "privacy.subtitle": "Effective date: April 11, 2026. This Privacy Policy explains how Nour Quran collects, uses, and protects user information.",
      "privacy.collectTitle": "1. Information We Collect",
      "privacy.collectBody": "We only collect data necessary to provide core app features and improve app performance.",
      "privacy.location": "Location Data: Used to provide accurate prayer times and determine Qibla direction.",
      "privacy.storage": "Storage Access: Used to save preferences and play Quran recitation files when available.",
      "privacy.useTitle": "2. How We Use Your Data",
      "privacy.useOne": "To enable location-based Islamic features such as prayer times and Qibla.",
      "privacy.useTwo": "To save preferences such as language, theme, and cookie consent.",
      "privacy.useThree": "To monitor app stability, usage trends, and improve user experience.",
      "privacy.thirdTitle": "3. Third-Party Services",
      "privacy.thirdBody": "Nour Quran may use trusted third-party tools that process limited data in accordance with their own privacy policies:",
      "privacy.google": "Google advertising services for ad delivery and performance measurement.",
      "privacy.supabase": "Supabase for authentication and session management when sign-in is used.",
      "privacy.analytics": "Analytics tools to monitor usage and improve the service.",
      "privacy.thirdNote": "These services may collect device identifiers, diagnostic data, or interaction metrics required to operate their services.",
      "privacy.childrenTitle": "4. Children's Privacy",
      "privacy.childrenBody": "Nour Quran does not knowingly collect personal information from children under the age of 13. If you are a parent or guardian and believe your child has provided personal data, please contact us so we can take appropriate action.",
      "privacy.deletionTitle": "5. Data Deletion Requests",
      "privacy.deletionBody": "You may request deletion of data associated with your app use by contacting us at the support email below with enough information for us to identify and process the request within a reasonable timeframe.",
      "privacy.securityTitle": "6. Data Security",
      "privacy.securityBody": "We apply reasonable technical and organizational measures to protect information from unauthorized access, disclosure, alteration, or destruction.",
      "privacy.updatesTitle": "7. Updates to This Policy",
      "privacy.updatesBody": "We may update this Privacy Policy from time to time. Any updates will be posted on this page with a revised effective date.",
      "privacy.supportTitle": "Support & Contact",
      "privacy.supportBody": "If you have questions, concerns, or requests related to this Privacy Policy, please contact us:",
      "privacy.footerNote": "By using Nour Quran, you acknowledge that you have read and understood this Privacy Policy."
    },
    fr: {
      "settings.title": "Paramètres",
      "settings.closeAria": "Fermer les paramètres",
      "settings.darkMode": "Mode sombre",
      "settings.prayerOffset": "Ajuster les horaires de prière",
      "settings.language": "Langue",
      "settings.share": "Partager l'application",
      "settings.signIn": "Se connecter",
      "nav.homeAria": "Retour à l'accueil",
      "nav.settingsAria": "Ouvrir les paramètres",
      "hero.badge": "Une application islamique simple et confortable",
      "hero.subtitle": "Votre compagnon quotidien pour le Coran, les adhkar, les douas et les horaires de prière",
      "hero.install": "Installer l'application sur le téléphone",
      "seo.kicker": "Plateforme coranique gratuite",
      "seo.title": "Lire, écouter et vivre le Coran au quotidien",
      "seo.description": "Bienvenue sur Nour Quran, votre plateforme complète et gratuite pour la lecture et l'écoute du Saint Coran. Profitez d'une interface fluide avec défilement automatique, des horaires de prière précis et d'une boussole Qibla intégrée.",
      "seo.featuresAria": "Fonctionnalités principales",
      "seo.feature.read": "Lecture du Coran",
      "seo.feature.listen": "Écoute audio",
      "seo.feature.prayer": "Prières & Qibla",
      "bookmark.label": "Continuer la lecture depuis",
      "apps.quran.title": "Saint Coran",
      "apps.quran.desc": "Lire et explorer les sourates",
      "apps.adhkar.title": "Adhkar",
      "apps.adhkar.desc": "La forteresse quotidienne du musulman",
      "apps.duas.title": "Douas",
      "apps.duas.desc": "Invocations choisies et complètes",
      "apps.favorites.title": "Favoris",
      "apps.favorites.desc": "Éléments enregistrés",
      "apps.salat.title": "Prière",
      "apps.salat.desc": "Horaires et Qibla",
      "apps.support.title": "Nous soutenir",
      "apps.support.desc": "Aidez le projet à continuer",
      "footer.aria": "Liens légaux et informations",
      "footer.privacy": "Politique de confidentialité",
      "footer.about": "À propos",
      "footer.contact": "Nous contacter",
      "footer.terms": "Conditions",
      "cookie.aria": "Avis de consentement aux cookies",
      "cookie.title": "Cookies et confidentialité",
      "cookie.message": "Nous utilisons des cookies pour personnaliser le contenu, diffuser des annonces pertinentes et analyser notre trafic. En continuant, vous acceptez notre politique.",
      "cookie.accept": "Accepter",
      "legal.backHome": "Retour à l'accueil",
      "about.metaTitle": "À propos | Nour Quran",
      "about.badge": "À propos",
      "about.title": "À propos de Nour Quran",
      "about.body": "Nour Quran est une plateforme numérique gratuite conçue pour proposer le Saint Coran, les adhkar, les douas, les horaires de prière et une boussole Qibla dans une expérience fluide et rapide sur le web et le mobile.",
      "contact.metaTitle": "Contact | Nour Quran",
      "contact.badge": "Contact",
      "contact.title": "Nous contacter",
      "contact.body": "Envoyez-nous vos remarques, suggestions ou demandes liées à la confidentialité par e-mail : support@nour-quran.com",
      "privacy.metaTitle": "Politique de confidentialité | Nour Quran",
      "privacy.badge": "Politique de confidentialité",
      "privacy.title": "Nour Quran - Politique de confidentialité",
      "privacy.subtitle": "Date d'effet : 11 avril 2026. Cette politique explique comment Nour Quran collecte, utilise et protège les informations des utilisateurs.",
      "privacy.collectTitle": "1. Informations que nous collectons",
      "privacy.collectBody": "Nous collectons uniquement les données nécessaires aux fonctionnalités principales de l'application et à l'amélioration de ses performances.",
      "privacy.location": "Données de localisation : utilisées pour fournir des horaires de prière précis et déterminer la direction de la Qibla.",
      "privacy.storage": "Accès au stockage : utilisé pour enregistrer les préférences et lire les fichiers de récitation du Coran lorsqu'ils sont disponibles.",
      "privacy.useTitle": "2. Comment nous utilisons vos données",
      "privacy.useOne": "Activer les fonctionnalités islamiques basées sur la localisation, comme les horaires de prière et la Qibla.",
      "privacy.useTwo": "Enregistrer les préférences telles que la langue, le thème et le consentement aux cookies.",
      "privacy.useThree": "Surveiller la stabilité de l'application, les tendances d'utilisation et améliorer l'expérience utilisateur.",
      "privacy.thirdTitle": "3. Services tiers",
      "privacy.thirdBody": "Nour Quran peut utiliser des outils tiers fiables qui traitent des données limitées selon leurs propres politiques de confidentialité :",
      "privacy.google": "Services publicitaires Google pour la diffusion d'annonces et la mesure des performances.",
      "privacy.supabase": "Supabase pour l'authentification et la gestion des sessions lorsque la connexion est utilisée.",
      "privacy.analytics": "Outils d'analyse pour suivre l'utilisation et améliorer le service.",
      "privacy.thirdNote": "Ces services peuvent collecter des identifiants d'appareil, des données de diagnostic ou des mesures d'interaction nécessaires à leur fonctionnement.",
      "privacy.childrenTitle": "4. Confidentialité des enfants",
      "privacy.childrenBody": "Nour Quran ne collecte pas sciemment d'informations personnelles auprès d'enfants de moins de 13 ans. Si vous êtes parent ou tuteur et pensez que votre enfant a fourni des données personnelles, contactez-nous afin que nous puissions agir.",
      "privacy.deletionTitle": "5. Demandes de suppression des données",
      "privacy.deletionBody": "Vous pouvez demander la suppression des données associées à votre utilisation de l'application en nous contactant à l'e-mail de support ci-dessous avec suffisamment d'informations pour identifier et traiter la demande dans un délai raisonnable.",
      "privacy.securityTitle": "6. Sécurité des données",
      "privacy.securityBody": "Nous appliquons des mesures techniques et organisationnelles raisonnables pour protéger les informations contre l'accès, la divulgation, la modification ou la destruction non autorisés.",
      "privacy.updatesTitle": "7. Mises à jour de cette politique",
      "privacy.updatesBody": "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Toute mise à jour sera publiée sur cette page avec une date d'effet révisée.",
      "privacy.supportTitle": "Support et contact",
      "privacy.supportBody": "Si vous avez des questions, préoccupations ou demandes liées à cette politique de confidentialité, contactez-nous :",
      "privacy.footerNote": "En utilisant Nour Quran, vous reconnaissez avoir lu et compris cette politique de confidentialité."
    }
  };

  function normalizeLanguage(language) {
    return SUPPORTED_LANGUAGES.includes(language) ? language : "ar";
  }

  function getLanguage() {
    return normalizeLanguage(localStorage.getItem(LANG_KEY) || "ar");
  }

  function translate(key, language = getLanguage()) {
    return translations[language]?.[key] || translations.ar[key] || key;
  }

  function applyLanguage(language = getLanguage()) {
    const nextLanguage = normalizeLanguage(language);
    const isArabic = nextLanguage === "ar";

    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = translate(element.dataset.i18n, nextLanguage);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      element.innerHTML = translate(element.dataset.i18nHtml, nextLanguage);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      element.setAttribute("aria-label", translate(element.dataset.i18nAria, nextLanguage));
    });

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.setAttribute("title", translate(element.dataset.i18nTitle, nextLanguage));
    });

    document.querySelectorAll("[data-i18n-document-title]").forEach(() => {
      document.title = translate(document.documentElement.dataset.i18nTitleKey, nextLanguage);
    });

    const titleKey = document.documentElement.dataset.i18nTitleKey;
    if (titleKey) document.title = translate(titleKey, nextLanguage);

    document.querySelectorAll("[data-language-selector]").forEach((select) => {
      select.value = nextLanguage;
    });

    window.dispatchEvent(new CustomEvent("nour:language-applied", { detail: { language: nextLanguage } }));
  }

  function setLanguage(language) {
    const nextLanguage = normalizeLanguage(language);
    localStorage.setItem(LANG_KEY, nextLanguage);
    applyLanguage(nextLanguage);
    window.dispatchEvent(new CustomEvent("nour:language-changed", { detail: { language: nextLanguage } }));
  }

  window.NourI18n = {
    LANG_KEY,
    translations,
    getLanguage,
    setLanguage,
    applyLanguage,
    translate
  };

  document.addEventListener("DOMContentLoaded", () => applyLanguage(getLanguage()));

  window.addEventListener("storage", (event) => {
    if (event.key === LANG_KEY) applyLanguage(getLanguage());
  });
})();
