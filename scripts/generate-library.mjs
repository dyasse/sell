import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  SITE_URL,
  PUBLISH_DATE,
  REVIEW_DATE,
  articles,
  articlesForCategory,
  categories,
  categoryFor,
  sources
} from '../content/library-data.mjs';

const EDITORIAL_TEAM_URL = `${SITE_URL}/authors/editorial-team.html`;
const indexableArticles = articles.filter((article) => article.qualityTier === 'pillar');

const surahNumbers = new Map(Object.entries({
  'الفاتحة': 1, 'البقرة': 2, 'آل عمران': 3, 'النساء': 4, 'المائدة': 5, 'الأنعام': 6,
  'الأعراف': 7, 'الأنفال': 8, 'التوبة': 9, 'يونس': 10, 'هود': 11, 'يوسف': 12,
  'الرعد': 13, 'إبراهيم': 14, 'الحجر': 15, 'النحل': 16, 'الإسراء': 17, 'الكهف': 18,
  'مريم': 19, 'طه': 20, 'الأنبياء': 21, 'الحج': 22, 'المؤمنون': 23, 'النور': 24,
  'الفرقان': 25, 'الشعراء': 26, 'النمل': 27, 'القصص': 28, 'العنكبوت': 29, 'الروم': 30,
  'لقمان': 31, 'السجدة': 32, 'الأحزاب': 33, 'سبأ': 34, 'فاطر': 35, 'يس': 36,
  'الصافات': 37, 'ص': 38, 'الزمر': 39, 'غافر': 40, 'فصلت': 41, 'الشورى': 42,
  'الزخرف': 43, 'الدخان': 44, 'الجاثية': 45, 'الأحقاف': 46, 'محمد': 47, 'الفتح': 48,
  'الحجرات': 49, 'ق': 50, 'الذاريات': 51, 'الطور': 52, 'النجم': 53, 'القمر': 54,
  'الرحمن': 55, 'الواقعة': 56, 'الحديد': 57, 'المجادلة': 58, 'الحشر': 59, 'الممتحنة': 60,
  'الصف': 61, 'الجمعة': 62, 'المنافقون': 63, 'التغابن': 64, 'الطلاق': 65, 'التحريم': 66,
  'الملك': 67, 'القلم': 68, 'الحاقة': 69, 'المعارج': 70, 'نوح': 71, 'الجن': 72,
  'المزمل': 73, 'المدثر': 74, 'القيامة': 75, 'الإنسان': 76, 'المرسلات': 77, 'النبأ': 78,
  'النازعات': 79, 'عبس': 80, 'التكوير': 81, 'الانفطار': 82, 'المطففين': 83, 'الانشقاق': 84,
  'البروج': 85, 'الطارق': 86, 'الأعلى': 87, 'الغاشية': 88, 'الفجر': 89, 'البلد': 90,
  'الشمس': 91, 'الليل': 92, 'الضحى': 93, 'الشرح': 94, 'التين': 95, 'العلق': 96,
  'القدر': 97, 'البينة': 98, 'الزلزلة': 99, 'العاديات': 100, 'القارعة': 101, 'التكاثر': 102,
  'العصر': 103, 'الهمزة': 104, 'الفيل': 105, 'قريش': 106, 'الماعون': 107, 'الكوثر': 108,
  'الكافرون': 109, 'النصر': 110, 'المسد': 111, 'الإخلاص': 112, 'الفلق': 113, 'الناس': 114
}));

function quranReference(ref) {
  const match = String(ref).match(/^(.+?)\s+(\d+)/);
  if (!match) return { label: ref, links: [] };
  const surah = surahNumbers.get(match[1].trim());
  const ayah = Number(match[2]);
  if (!surah || !ayah) return { label: ref, links: [] };
  return {
    label: ref,
    links: [
      { label: 'التفسير الميسر', url: `https://quranenc.com/ar/browse/arabic_moyassar/${surah}/${ayah}` },
      { label: 'تفسير السعدي', url: `https://quran.ksu.edu.sa/tafseer/saadi/sura${surah}-aya${ayah}.html` }
    ]
  };
}

const categoryGuides = {
  'quran-stories': {
    scope: 'نقرأ القصة من مواضعها المتعددة، ثم نميز بين الخبر القرآني، وما يشرحه المفسر، والدروس التربوية التي يصوغها المحرر.',
    caution: 'لا نكمل الفراغات بحكايات مشهورة لمجرد انسجامها مع القصة، ولا نحول العبرة العامة إلى حكم على أشخاص معاصرين.',
    practice: 'اقرأ المواضع بالترتيب، واكتب التحول الرئيس في القصة، ثم اختر خلقاً واحداً يظهر في قرار عملي هذا الأسبوع.'
  },
  'seerah-history': {
    scope: 'نجمع الآيات المتصلة بالحدث مع الروايات التي يمكن تتبع مصدرها، ونفصل بين الثابت، والاستنتاج التاريخي، والدرس المعاصر.',
    caution: 'لا ندمج روايات متفرقة في خطاب واحد، ولا ننسب عبارة شائعة إلى النبي ﷺ قبل التحقق من مصدرها وحكم أهل الحديث.',
    practice: 'حدد القرار الذي واجهه أصحاب الحدث، والخيارات المتاحة لهم، ثم دوّن مبدأً يمكن تطبيقه من غير إسقاط متكلف.'
  },
  'quran-sciences': {
    scope: 'نقدم مدخلاً تعليمياً يشرح المصطلح ووظيفته وحدوده، مع إحالة القارئ إلى منصات تفسير وعلوم قرآن ذات منهجية معلنة.',
    caution: 'المقالة المختصرة لا تصنع متخصصاً، ولا يجوز بناء فتوى أو ترجيح دقيق على ملخص عام أو نتيجة بحث منفردة.',
    practice: 'طبّق القاعدة على مقطع قصير، ثم قارن فهمك بتفسيرين معروفين وسجل موضع الاتفاق وموضع السؤال.'
  },
  'faith-character': {
    scope: 'نربط المعنى الإيماني بالسلوك اليومي مع إبقاء الفرق واضحاً بين التوجيه التربوي العام والحكم الشرعي الخاص.',
    caution: 'لا نستخدم النصوص لإسكات الألم أو لوم المتضرر، ولا نجعل الخطوة الروحية بديلاً عن علاج أو حماية أو استشارة متخصصة عند الحاجة.',
    practice: 'اختر سلوكاً صغيراً قابلاً للملاحظة، وحدد متى ستفعله وما العلامة التي تدل على أنك التزمت به.'
  }
};

const wordCountOf = (value = '') => String(value).trim().split(/\s+/).filter(Boolean).length;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatDate = (date) => new Intl.DateTimeFormat('ar-MA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(new Date(`${date}T12:00:00Z`));

const jsonLd = (data) => JSON.stringify(data).replaceAll('<', '\\u003c');

function head({ title, description, canonical, relative = '..', type = 'website', schema = [], indexable = true, ads = true }) {
  const schemaMarkup = schema.map((item) =>
    `<script type="application/ld+json">${jsonLd(item)}</script>`).join('\n  ');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${indexable ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,follow'}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="نور" />
  <meta property="og:locale" content="ar_AR" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${SITE_URL}/assets/images/nour-logo.png" />
  <meta name="twitter:card" content="summary" />
  <meta name="theme-color" content="#1f6f50" />
  ${ads ? '<meta name="google-adsense-account" content="ca-pub-2350255696934759" />' : ''}
  <link rel="icon" href="${relative}/assets/favicon.png" />
  <link rel="alternate" type="application/rss+xml" title="موسوعة نور" href="${SITE_URL}/feed.xml" />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${relative}/styles.css" />
  <link rel="stylesheet" href="${relative}/library.css" />
  ${ads ? '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2350255696934759" crossorigin="anonymous"></script>' : ''}
  ${schemaMarkup}
</head>`;
}

function nav(relative = '..', current = 'library') {
  const links = [
    ['home', `${relative}/index.html`, 'الرئيسية'],
    ['quran', `${relative}/quran.html`, 'القرآن الكريم'],
    ['adhkar', `${relative}/adhkar.html`, 'الأذكار'],
    ['duas', `${relative}/duas.html`, 'الأدعية'],
    ['library', `${relative}/articles.html`, 'المكتبة'],
    ['sources', `${relative}/sources.html`, 'المراجع والمنهجية']
  ];

  return `<nav class="site-primary-nav library-nav" aria-label="التنقل الرئيسي">
    ${links.map(([key, href, label]) =>
      `<a href="${href}"${key === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
  </nav>`;
}

function footer(relative = '..') {
  return `<footer class="bottom-meta-nav library-footer">
    <a href="${relative}/about.html">من نحن</a>
    <a href="${relative}/editorial-policy.html">سياسة التحرير</a>
    <a href="${relative}/sources.html">المراجع والمنهجية</a>
    <a href="${relative}/contact.html">الإبلاغ عن خطأ</a>
    <a href="${relative}/corrections.html">سجل التصحيحات</a>
    <a href="${relative}/sitemap.html">خريطة الموقع</a>
    <a href="${relative}/privacy-policy.html">الخصوصية</a>
  </footer>`;
}

function articleCard(article, relative = '.') {
  const category = categoryFor(article.category);
  const isPillar = article.qualityTier === 'pillar';
  return `<article class="knowledge-card" data-library-card data-search="${escapeHtml(`${article.title} ${article.description} ${category.name}`)}">
    <span class="knowledge-card__category">${escapeHtml(category.name)} · ${isPillar ? 'ملف معمّق' : 'موجز'}</span>
    <h3><a href="${relative}/library/${article.slug}.html">${escapeHtml(article.title)}</a></h3>
    <p>${escapeHtml(article.description)}</p>
    <div class="knowledge-card__meta"><span>${article.quranRefs.length} مواضع قرآنية</span><span>${article.sections.length} محاور</span><span>${isPillar ? 'مفهرس' : 'قيد التوسعة'}</span></div>
    <a class="knowledge-card__link" href="${relative}/library/${article.slug}.html">اقرأ المقالة <span aria-hidden="true">←</span></a>
  </article>`;
}

function renderArticle(article) {
  const isPillar = article.qualityTier === 'pillar';
  const category = categoryFor(article.category);
  const guide = categoryGuides[article.category];
  const canonical = `${SITE_URL}/library/${article.slug}.html`;
  const allCategoryArticles = articlesForCategory(article.category);
  const categoryArticles = isPillar
    ? allCategoryArticles.filter((item) => item.qualityTier === 'pillar')
    : allCategoryArticles;
  const currentIndex = categoryArticles.findIndex((item) => item.slug === article.slug);
  const related = [1, 2, 3].map((offset) =>
    categoryArticles[(currentIndex + offset) % categoryArticles.length]).filter((item) => item.slug !== article.slug);
  const seenSourceUrls = new Set();
  const usedSources = [...new Set(article.sourceKeys)]
    .filter((key) => {
      const url = sources[key]?.url;
      if (!url || seenSourceUrls.has(url)) return false;
      seenSourceUrls.add(url);
      return true;
    })
    .map((key, index) => ({ ...sources[key], key, number: index + 1 }));
  const quranReferences = article.quranRefs.map(quranReference);
  const exactQuranLinks = quranReferences.flatMap((reference) => reference.links.map((link) => link.url));
  const sourceLinks = [...new Set([...exactQuranLinks, ...usedSources.map((source) => source.url)])];
  const practicalSteps = [
    `اقرأ المواضع القرآنية المذكورة كاملة، ولا تكتف بالآية المنفردة أو المقتطف المتداول.`,
    `لخّص بعبارتك الفرق بين «${article.sections[0][0]}» و«${article.sections[1][0]}».`,
    guide.practice,
    `إذا تعلق السؤال بفتوى أو حق شخصي أو نزاع، توقف عند الفهم العام واسأل مختصاً مؤهلاً يعرف تفاصيل الحالة.`
  ];
  const faq = [
    {
      question: `ما الفكرة الأساسية في «${article.title}»؟`,
      answer: article.description
    },
    {
      question: 'ما المصادر التي بُنيت عليها هذه الصفحة؟',
      answer: `تبدأ الصفحة من المواضع القرآنية: ${article.quranRefs.join('، ')}، ثم تقارن الشرح بمراجع مؤسسية معلنة في أسفل المقالة. الروابط وسيلة للتثبت وليست تزكية للموقع.`
    },
    {
      question: 'هل يمكن اعتماد هذه المقالة فتوى أو حكماً خاصاً؟',
      answer: 'لا. هذه مادة تعليمية عامة تشرح المعنى وتفتح طريق البحث. الفتوى والنوازل والحقوق الخاصة تحتاج عالماً أو جهة مختصة تعرف الواقعة وتفاصيلها.'
    }
  ];
  const renderedWordCount = wordCountOf([
    article.description,
    ...article.sections.flatMap((section) => section),
    guide.scope,
    guide.caution,
    ...practicalSteps,
    ...faq.flatMap((item) => [item.question, item.answer]),
    ...usedSources.flatMap((source) => [source.name, source.detail])
  ].join(' '));
  const readingTime = Math.max(6, Math.ceil(renderedWordCount / 105));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    inLanguage: 'ar',
    datePublished: article.publishedAt || PUBLISH_DATE,
    dateModified: article.reviewedAt,
    author: { '@type': 'Organization', name: 'فريق تحرير نور', url: EDITORIAL_TEAM_URL },
    editor: { '@type': 'Organization', name: 'فريق تحرير نور', url: EDITORIAL_TEAM_URL },
    publisher: { '@type': 'Organization', name: 'نور', url: SITE_URL },
    mainEntityOfPage: canonical,
    articleSection: category.name,
    wordCount: renderedWordCount,
    citation: sourceLinks,
    isAccessibleForFree: true
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'المكتبة', item: `${SITE_URL}/articles.html` },
      { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/library/${category.slug}.html` },
      { '@type': 'ListItem', position: 4, name: article.title, item: canonical }
    ]
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };

  return `${head({
    title: `${article.title} | مكتبة نور`,
    description: article.description,
    canonical,
    type: 'article',
    schema: isPillar ? [articleSchema, breadcrumbSchema, faqSchema] : [breadcrumbSchema],
    indexable: isPillar,
    ads: isPillar
  })}
<body class="knowledge-page">
  ${nav('..', 'library')}
  <main class="knowledge-shell">
    <nav class="breadcrumbs" aria-label="مسار الصفحة">
      <a href="../index.html">الرئيسية</a><span>/</span>
      <a href="../articles.html">المكتبة</a><span>/</span>
      <a href="${category.slug}.html">${escapeHtml(category.name)}</a>
    </nav>
    <article class="knowledge-article">
      <header class="knowledge-article__header">
        <span class="knowledge-eyebrow">${escapeHtml(category.eyebrow)} · ${escapeHtml(category.name)}</span>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="knowledge-deck">${escapeHtml(article.description)}</p>
        <div class="knowledge-byline">
          <span>إعداد: <a href="../authors/editorial-team.html" rel="author">فريق تحرير نور</a></span>
          <span>آخر تدقيق للمصادر: <time datetime="${article.reviewedAt}">${formatDate(article.reviewedAt)}</time></span>
          <span>${readingTime} دقائق · ${isPillar ? 'ملف مرجعي معمّق' : 'موجز قيد التوسعة'}</span>
        </div>
      </header>
      <aside class="source-boundary" aria-label="حدود المقالة">
        <strong>حالة المراجعة بشفافية</strong>
        <p>${escapeHtml(article.reviewLevel)}. مواضع القرآن هي المصدر الأول، أما الشرح والدروس فصياغة تعليمية أصلية من فريق نور وليست نصاً من القرآن ولا فتوى. ${isPillar ? 'اجتازت هذه الصفحة بوابة النشر المعمّق وتدخل في خريطة Google.' : 'هذه نسخة موجزة غير مفهرسة وغير معروضة للإعلانات حتى تستكمل التوسعة والمراجعة.'}</p>
      </aside>
      <nav class="article-toc" aria-label="فهرس المقالة">
        <strong>في هذه الصفحة</strong>
        <ol>
          <li><a href="#summary">الخلاصة</a></li>
          <li><a href="#quranRefs">المواضع القرآنية</a></li>
          ${article.sections.map((section, index) => `<li><a href="#section-${index + 1}">${escapeHtml(section[0])}</a></li>`).join('')}
          <li><a href="#practice">خطة تطبيق</a></li>
          <li><a href="#questions">أسئلة شائعة</a></li>
          <li><a href="#articleSources">المراجع</a></li>
        </ol>
      </nav>
      <section class="article-summary" id="summary" aria-labelledby="summaryTitle">
        <span>الخلاصة في دقيقة</span>
        <h2 id="summaryTitle">ماذا ستخرج به؟</h2>
        <ul>${article.sections.map(([heading]) => `<li>${escapeHtml(heading)}</li>`).join('')}</ul>
      </section>
      <section class="quran-reference-box" aria-labelledby="quranRefs">
        <h2 id="quranRefs">مواضع القصة أو الموضوع في القرآن</h2>
        <ul>${quranReferences.map((reference) => `<li><strong>${escapeHtml(reference.label)}</strong>${reference.links.length ? `<span class="verse-source-links">${reference.links.map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer external">${link.label}</a>`).join('')}</span>` : ''}</li>`).join('')}</ul>
        <p>يُنصح بقراءة المقطع كاملاً من <a href="../quran.html">مصحف نور</a> أو من مصحف موثوق قبل قراءة الشرح.</p>
      </section>
      <div class="knowledge-article__body">
        ${article.sections.map(([heading, paragraph], index) => {
          const cited = usedSources[index % usedSources.length];
          return `<section id="section-${index + 1}"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(paragraph)} <a class="inline-citation" href="#ref-${cited.key}" aria-label="انظر المرجع ${cited.number}">[${cited.number}]</a></p></section>`;
        }).join('')}
        <section class="reading-method">
          <h2>كيف بُني هذا الفهم؟</h2>
          <p>${escapeHtml(guide.scope)}</p>
          <p><strong>حد مهم:</strong> ${escapeHtml(guide.caution)}</p>
        </section>
      </div>
      <section class="practice-plan" id="practice" aria-labelledby="practiceTitle">
        <span>من المعرفة إلى العمل</span>
        <h2 id="practiceTitle">خطة تطبيق من أربع خطوات</h2>
        <ol>${practicalSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
      </section>
      <section class="article-faq" id="questions" aria-labelledby="faqTitle">
        <h2 id="faqTitle">أسئلة شائعة</h2>
        ${faq.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}
      </section>
      <section class="article-sources" aria-labelledby="articleSources">
        <h2 id="articleSources">المراجع المستخدمة</h2>
        <p>روابط الآيات أعلاه تقود إلى موضع محدد، ورُوجعت الروابط المؤسسية بتاريخ <time datetime="${REVIEW_DATE}">${formatDate(REVIEW_DATE)}</time>. ذكر المرجع لا يعني أن المؤسسة راجعت مقالة نور أو تزكيها.</p>
        <ol>${usedSources.map((source) =>
          `<li id="ref-${source.key}"><a href="${source.url}" target="_blank" rel="noopener noreferrer external">${escapeHtml(source.name)}</a><span>${escapeHtml(source.detail)}</span><small>تم الوصول: ${formatDate(REVIEW_DATE)}</small></li>`).join('')}</ol>
        <a class="method-link" href="../sources.html">اطلع على منهجية التوثيق كاملة</a>
      </section>
      <aside class="correction-inline">
        <strong>التوثيق قابل للتصحيح</strong>
        <p>إذا وجدت خطأ في آية أو نسبة أو رابط، أرسل عنوان الصفحة والموضع والمصدر المقترح.</p>
        <a href="../contact.html">أبلغ فريق التحرير</a>
      </aside>
      <section class="related-knowledge" aria-labelledby="relatedTitle">
        <h2 id="relatedTitle">اقرأ بعد ذلك</h2>
        <div class="related-grid">${related.map((item) =>
          `<a href="${item.slug}.html"><span>${escapeHtml(category.name)}</span><strong>${escapeHtml(item.title)}</strong></a>`).join('')}</div>
      </section>
    </article>
  </main>
  ${footer('..')}
  <script src="../app-shell.js"></script>
</body>
</html>`;
}

function renderCategory(category) {
  const categoryArticles = articlesForCategory(category.slug);
  const pillarArticles = categoryArticles.filter((article) => article.qualityTier === 'pillar');
  const briefArticles = categoryArticles.filter((article) => article.qualityTier !== 'pillar');
  const canonical = `${SITE_URL}/library/${category.slug}.html`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: canonical,
    inLanguage: 'ar',
    hasPart: pillarArticles.map((article) => ({
      '@type': 'Article',
      name: article.title,
      url: `${SITE_URL}/library/${article.slug}.html`
    }))
  };

  return `${head({
    title: `${category.name} | مكتبة نور`,
    description: category.description,
    canonical,
    schema: [schema]
  })}
<body class="knowledge-page">
  ${nav('..', 'library')}
  <main class="knowledge-shell">
    <nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="../index.html">الرئيسية</a><span>/</span><a href="../articles.html">المكتبة</a></nav>
    <header class="collection-hero">
      <span class="knowledge-eyebrow">${escapeHtml(category.eyebrow)}</span>
      <h1>${escapeHtml(category.name)}</h1>
      <p>${escapeHtml(category.description)}</p>
      <div class="collection-count">${pillarArticles.length} ملفات معمّقة مفهرسة · ${briefArticles.length} موجزات قيد التوسعة</div>
    </header>
    <section class="library-catalog" aria-labelledby="pillarCategoryTitle">
      <div class="catalog-heading"><div><span>النسخة المرجعية</span><h2 id="pillarCategoryTitle">ملفات اجتازت بوابة النشر</h2></div></div>
      <div class="knowledge-grid">${pillarArticles.map((article) => articleCard(article, '..')).join('')}</div>
    </section>
    <section class="library-catalog briefs-catalog" aria-labelledby="briefCategoryTitle">
      <div class="catalog-heading"><div><span>مسار التطوير</span><h2 id="briefCategoryTitle">موجزات متاحة وغير مفهرسة</h2></div><p>لا إعلانات داخلها حتى تكتمل</p></div>
      <div class="knowledge-grid">${briefArticles.map((article) => articleCard(article, '..')).join('')}</div>
    </section>
    <aside class="editorial-callout">
      <h2>منهج واحد في جميع الصفحات</h2>
      <p>نحدد مواضع القرآن، ونميز الشرح التحريري عن النص، ونعلن المراجع وتاريخ المراجعة، ونفتح باب التصحيح.</p>
      <a href="../sources.html">اقرأ منهجية التوثيق</a>
    </aside>
  </main>
  ${footer('..')}
  <script src="../app-shell.js"></script>
</body>
</html>`;
}

function renderIndex() {
  const canonical = `${SITE_URL}/articles.html`;
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'مكتبة نور الدينية',
    description: 'موسوعة عربية موثقة في قصص القرآن والسيرة ومفاتيح القرآن والإيمان والأخلاق.',
    url: canonical,
    inLanguage: 'ar',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: indexableArticles.length,
      itemListElement: indexableArticles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/library/${article.slug}.html`,
        name: article.title
      }))
    }
  };

  return `${head({
    title: 'مكتبة نور الدينية | قصص القرآن والسيرة ومفاتيح الفهم',
    description: 'موسوعة دينية عربية تضم قصص القرآن والسيرة النبوية ومفاتيح التفسير وأدلة الإيمان والأخلاق، بمراجع معلنة ومراجعة بشرية.',
    canonical,
    relative: '.',
    schema: [collectionSchema]
  })}
<body class="knowledge-page">
  ${nav('.', 'library')}
  <main class="knowledge-shell">
    <header class="library-mega-hero">
      <div>
        <span class="knowledge-eyebrow">موسوعة نور العربية</span>
        <h1>اقرأ المعنى من مصدره، ثم حوّله إلى عمل</h1>
        <p>مقالات أصلية في قصص القرآن والسيرة ومفاتيح الفهم والإيمان والأخلاق. كل صفحة تعلن مواضع القرآن، وحدود التحرير، ومستوى المراجعة، والمراجع وتاريخ الوصول إليها.</p>
        <div class="library-search"><label for="librarySearch">ابحث في المكتبة</label><input id="librarySearch" type="search" placeholder="مثال: يوسف، التوبة، التفسير…" autocomplete="off" /></div>
      </div>
      <dl class="library-metrics">
        <div><dt>${indexableArticles.length}</dt><dd>ملفاً معمّقاً مفهرساً</dd></div>
        <div><dt>${categories.length}</dt><dd>أبواب رئيسية</dd></div>
        <div><dt>${articles.length - indexableArticles.length}</dt><dd>موجزاً في مسار التوسعة</dd></div>
      </dl>
    </header>
    <section class="category-door-grid" aria-label="أبواب المكتبة">
      ${categories.map((category) => `<a href="library/${category.slug}.html">
        <span>${escapeHtml(category.eyebrow)}</span><strong>${escapeHtml(category.name)}</strong>
        <p>${escapeHtml(category.description)}</p><small>${articlesForCategory(category.slug).length} مقالة ←</small>
      </a>`).join('')}
    </section>
    <section class="library-catalog" aria-labelledby="catalogTitle">
      <div class="catalog-heading"><div><span>كل الصفحات</span><h2 id="catalogTitle">تصفّح الموسوعة</h2></div><p id="resultCount" aria-live="polite">${articles.length} نتيجة</p></div>
      <div class="knowledge-grid" id="libraryGrid">${articles.map((article) => articleCard(article)).join('')}</div>
      <p class="no-results" id="noResults" hidden>لم نعثر على نتيجة. جرّب كلمة أقصر أو تصفح أحد الأبواب.</p>
    </section>
    <aside class="editorial-callout">
      <h2>الثقة تبدأ من معرفة المصدر</h2>
      <p>لكل مقالة مواضع قرآنية محددة، ومراجع خارجية معلنة، وتاريخ تدقيق، ووصف صريح لمستوى المراجعة. نستقبل التصحيحات ولا نقدم المقالات العامة بوصفها فتوى.</p>
      <a href="sources.html">المراجع ومنهجية التحرير</a>
    </aside>
  </main>
  ${footer('.')}
  <script>
    (() => {
      const input = document.getElementById('librarySearch');
      const cards = [...document.querySelectorAll('[data-library-card]')];
      const count = document.getElementById('resultCount');
      const empty = document.getElementById('noResults');
      const normalize = (value) => value.toLocaleLowerCase('ar').normalize('NFKD').replace(/[\\u064B-\\u065F\\u0670]/g, '');
      input.addEventListener('input', () => {
        const query = normalize(input.value.trim());
        let visible = 0;
        cards.forEach((card) => {
          const matches = !query || normalize(card.dataset.search).includes(query);
          card.hidden = !matches;
          if (matches) visible += 1;
        });
        count.textContent = visible + ' نتيجة';
        empty.hidden = visible !== 0;
      });
    })();
  </script>
  <script src="app-shell.js"></script>
</body>
</html>`;
}

function renderSources() {
  const canonical = `${SITE_URL}/sources.html`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'المراجع ومنهجية التوثيق في نور',
    url: canonical,
    dateModified: REVIEW_DATE,
    inLanguage: 'ar'
  };

  return `${head({
    title: 'المراجع ومنهجية التوثيق | نور',
    description: 'كيف يختار فريق نور المصادر، ويفصل بين النص القرآني والشرح، ويراجع المقالات ويصححها.',
    canonical,
    relative: '.',
    schema: [schema]
  })}
<body class="knowledge-page">
  ${nav('.', 'sources')}
  <main class="knowledge-shell methodology-shell">
    <header class="collection-hero">
      <span class="knowledge-eyebrow">الشفافية قبل الادعاء</span>
      <h1>المراجع ومنهجية التوثيق</h1>
      <p>هذه الصفحة تشرح كيف نبني مكتبة نور، وما الذي نعد به القارئ، وما الذي لا تدعيه المقالات.</p>
      <div class="collection-count">آخر مراجعة: ${formatDate(REVIEW_DATE)}</div>
    </header>
    <section class="methodology-grid">
      <article><span>01</span><h2>النص أولاً</h2><p>نحدد السورة والآيات، ونطلب من القارئ الرجوع إلى المقطع كاملاً. لا نخلط كلام المحرر بنص القرآن، ولا نضع علامات الاقتباس حول معنى من صياغتنا.</p></article>
      <article><span>02</span><h2>تفسير معروف</h2><p>عند شرح معنى نعتمد كتب التفسير المعروفة أو المنصات المؤسسية التي تجمعها، ونبتعد عن الحسابات المجهولة والاقتباسات التي لا يمكن تتبعها.</p></article>
      <article><span>03</span><h2>تحقق الحديث</h2><p>لا ننسب كلاماً إلى النبي ﷺ لمجرد انتشاره. نراجع المصدر والتخريج وحكم المحدثين، ونترك النص إذا لم نستطع إثبات نسبته.</p></article>
      <article><span>04</span><h2>لا فتوى شخصية</h2><p>مقالاتنا تعليمية عامة. المسائل الفقهية الخاصة والنوازل والحقوق المتنازع فيها تحتاج عالماً مؤهلاً يعرف تفاصيل الحالة.</p></article>
      <article><span>05</span><h2>مستوى مراجعة معلن</h2><p>نعلن إن كانت المراجعة تحريرية ومقارنة مصادر فقط، ولا ننسب مراجعة شرعية إلى عالم أو مؤسسة لم تشارك فعلياً. عند ثبوت خطأ نصححه ونراجع الصفحات المرتبطة به.</p></article>
      <article><span>06</span><h2>روابط آمنة</h2><p>الروابط الخارجية تفتح بشكل منفصل مع حماية تقنية، ونصف سبب استخدامها. ذكر المصدر لا يعني أنه راجع منصة نور أو يزكيها.</p></article>
    </section>
    <section class="reference-directory" aria-labelledby="referenceTitle">
      <h2 id="referenceTitle">دليل المراجع الأساسية</h2>
      <div>${Object.values(sources).filter((source, index, all) =>
        all.findIndex((item) => item.url === source.url && item.name === source.name) === index).map((source) =>
          `<article><h3><a href="${source.url}" target="_blank" rel="noopener noreferrer external">${escapeHtml(source.name)}</a></h3><p>${escapeHtml(source.detail)}</p><span>آخر تحقق من الرابط: ${formatDate(REVIEW_DATE)}</span></article>`).join('')}</div>
    </section>
    <section class="correction-box">
      <h2>وجدت خطأ أو مرجعاً يحتاج تحديثاً؟</h2>
      <p>أرسل عنوان الصفحة، العبارة المعنية، والمرجع الذي يوضح التصحيح. لا نحتاج بيانات شخصية غير ضرورية.</p>
      <a href="contact.html">أرسل ملاحظة تحريرية</a>
    </section>
  </main>
  ${footer('.')}
  <script src="app-shell.js"></script>
</body>
</html>`;
}

function renderEditorialTeam() {
  const canonical = EDITORIAL_TEAM_URL;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'فريق تحرير نور',
    url: canonical,
    parentOrganization: { '@type': 'Organization', name: 'نور', url: SITE_URL },
    description: 'هيئة تحرير داخلية تُعد المقالات التعليمية في نور وتوثق مصادرها وحدود مراجعتها.'
  };

  return `${head({
    title: 'فريق تحرير نور | من يكتب الموسوعة؟',
    description: 'تعرف إلى مسؤولية فريق تحرير نور، مراحل إعداد المقالة، حدود المراجعة، وكيف نتعامل مع المصادر والتصحيحات.',
    canonical,
    relative: '..',
    schema: [schema]
  })}
<body class="knowledge-page">
  ${nav('..', 'library')}
  <main class="knowledge-shell methodology-shell">
    <nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="../index.html">الرئيسية</a><span>/</span><a href="../articles.html">المكتبة</a><span>/</span><span>فريق التحرير</span></nav>
    <header class="collection-hero">
      <span class="knowledge-eyebrow">الاسم لا يكفي؛ المنهج هو الدليل</span>
      <h1>من يكتب موسوعة نور؟</h1>
      <p>تُنشر المقالات باسم فريق تحرير نور: هيئة داخلية مسؤولة عن الصياغة العربية، وربط الادعاءات بالمصادر، وإعلان حدود كل صفحة، واستقبال التصحيح.</p>
      <div class="collection-count">لا ندّعي مراجعة شرعية خارجية غير موجودة</div>
    </header>
    <section class="editorial-profile" aria-labelledby="responsibilityTitle">
      <article>
        <h2 id="responsibilityTitle">مسؤوليتنا التحريرية</h2>
        <p>نكتب الشرح والدروس بصياغة مخصصة لنور، ولا ننسخ مقالات الجهات المرجعية. نعود إلى القرآن والتفسير والموسوعات الحديثية، ثم نضع روابطها حتى يستطيع القارئ التثبت بنفسه.</p>
        <p>قد تساعد أدوات رقمية في التنظيم والبحث اللغوي، لكنها لا تتحول إلى اسم خبير ولا تمنح المادة مراجعة شرعية. المسؤولية النهائية عن النص المنشور والتصحيح تقع على إدارة نور.</p>
      </article>
      <article>
        <h2>ما الذي لا ندعيه؟</h2>
        <p>فريق التحرير ليس دار إفتاء، ولا ينسب الاعتماد إلى مجمع أو جامعة أو عالم لم يراجع النص فعلياً. ذكر مؤسسة في المراجع يعني أننا أحلنا إلى مادتها للتثبت، وليس أنها تزكي نور.</p>
        <p>عندما تحتاج المسألة معرفة حال شخص أو حقوقاً متنازعاً فيها أو ترجيحاً فقهياً متخصصاً، نحيل إلى أهل العلم والجهة المختصة بدلاً من إعطاء جواب عام بثقة زائدة.</p>
      </article>
    </section>
    <section class="review-pipeline" aria-labelledby="pipelineTitle">
      <span class="knowledge-eyebrow">مسار النشر</span>
      <h2 id="pipelineTitle">خمس بوابات قبل الفهرسة</h2>
      <ol>
        <li><strong>تحديد السؤال:</strong><span>موضوع واحد ونية تعليمية واضحة، لا عنوان مصنوع لجلب النقرات.</span></li>
        <li><strong>خريطة المصادر:</strong><span>مواضع القرآن أولاً، ثم تفسير أو حديث أو مرجع مؤسسي بحسب الادعاء.</span></li>
        <li><strong>صياغة أصلية:</strong><span>شرح يضيف تنظيماً وسياقاً وتطبيقاً، لا إعادة ترتيب لعبارات المصدر.</span></li>
        <li><strong>فحص الحدود:</strong><span>تمييز النص عن الشرح، وحذف الادعاء الذي لا نستطيع توثيقه، وإعلان مستوى المراجعة.</span></li>
        <li><strong>تصحيح مستمر:</strong><span>تاريخ واضح، وفحص للروابط، وقناة للإبلاغ، وتحديث الصفحة المرتبطة عند تغير المرجع.</span></li>
      </ol>
    </section>
    <section class="correction-box">
      <h2>ساعدنا على رفع الدقة</h2>
      <p>أرسل رابط الصفحة والعبارة والمصدر الذي يوضح التصحيح. نراجع البلاغ ولا نطلب بيانات شخصية لا يحتاجها التحقيق.</p>
      <a href="../contact.html">تواصل مع فريق التحرير</a>
    </section>
  </main>
  ${footer('..')}
  <script src="../app-shell.js"></script>
</body>
</html>`;
}

function renderCorrections() {
  const canonical = `${SITE_URL}/corrections.html`;
  return `${head({
    title: 'سجل التصحيحات والتحديثات | نور',
    description: 'سجل علني يوضح التصحيحات الجوهرية والتحديثات المنهجية في موسوعة نور.',
    canonical,
    relative: '.',
    ads: false,
    schema: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'سجل التصحيحات والتحديثات', url: canonical, dateModified: REVIEW_DATE, inLanguage: 'ar' }]
  })}
<body class="knowledge-page">
  ${nav('.', 'sources')}
  <main class="knowledge-shell methodology-shell">
    <header class="collection-hero"><span class="knowledge-eyebrow">الثقة تقبل التصحيح</span><h1>سجل التصحيحات والتحديثات</h1><p>نعلن هنا التغييرات التي تمس معنى المادة أو مصدرها أو مستوى مراجعتها. تصحيح الإملاء والتنسيق لا يُسجل كتغيير جوهري.</p><div class="collection-count">آخر تحديث: ${formatDate(REVIEW_DATE)}</div></header>
    <section class="review-pipeline" aria-labelledby="changeLogTitle"><h2 id="changeLogTitle">آخر التغييرات المنهجية</h2><ol>
      <li><strong>${formatDate(REVIEW_DATE)}</strong><span>اعتماد 16 ملفاً معمقاً فقط للفهرسة، وتحويل الموجزات غير المكتملة إلى صفحات noindex وبلا إعلانات.</span></li>
      <li><strong>${formatDate(REVIEW_DATE)}</strong><span>إضافة روابط مباشرة لكل موضع قرآني إلى التفسير الميسر وتفسير السعدي، وتقسيم خريطة الموقع حسب نوع الصفحة.</span></li>
      <li><strong>27 أغسطس 2026</strong><span>إطلاق سياسة التحرير وصفحة فريق نور ومنهجية التوثيق وقناة الإبلاغ عن الخطأ.</span></li>
    </ol></section>
    <section class="correction-box"><h2>كيف ترسل تصحيحاً؟</h2><p>أرسل رابط الصفحة، والعبارة المعنية، وسبب الاعتراض، ورابطاً إلى مصدر يمكن تتبعه. نراجع البلاغ ونحدث السجل إذا تغير المعنى أو المصدر.</p><a href="contact.html">أرسل بلاغاً تحريرياً</a></section>
  </main>${footer('.')}<script src="app-shell.js"></script>
</body></html>`;
}

function renderHtmlSitemap() {
  const canonical = `${SITE_URL}/sitemap.html`;
  return `${head({
    title: 'خريطة موقع نور | جميع الأقسام المعتمدة',
    description: 'خريطة بشرية لأقسام نور وملفات الموسوعة المعمقة وصفحات المنهجية والسياسات.',
    canonical,
    relative: '.',
    ads: false
  })}
<body class="knowledge-page">
  ${nav('.', 'library')}
  <main class="knowledge-shell methodology-shell"><header class="collection-hero"><span class="knowledge-eyebrow">وصول واضح بلا صفحات يتيمة</span><h1>خريطة موقع نور</h1><p>هذه الخريطة تعرض الصفحات المعتمدة للفهرسة. الموجزات قيد التوسعة تبقى متاحة من داخل أبواب المكتبة ولا تدخل خريطة Google.</p></header>
    <section class="methodology-grid"><article><h2>الأقسام الرئيسية</h2><ul><li><a href="index.html">الرئيسية</a></li><li><a href="quran.html">القرآن الكريم</a></li><li><a href="adhkar.html">الأذكار</a></li><li><a href="duas.html">الأدعية</a></li><li><a href="salat.html">مواقيت الصلاة</a></li><li><a href="articles.html">الموسوعة</a></li></ul></article>
    <article><h2>الثقة والسياسات</h2><ul><li><a href="about.html">من نحن</a></li><li><a href="authors/editorial-team.html">فريق التحرير</a></li><li><a href="sources.html">المراجع والمنهجية</a></li><li><a href="editorial-policy.html">سياسة التحرير</a></li><li><a href="corrections.html">سجل التصحيحات</a></li><li><a href="privacy-policy.html">الخصوصية</a></li></ul></article></section>
    ${categories.map((category) => `<section class="reference-directory"><h2><a href="library/${category.slug}.html">${escapeHtml(category.name)}</a></h2><div>${indexableArticles.filter((article) => article.category === category.slug).map((article) => `<article><h3><a href="library/${article.slug}.html">${escapeHtml(article.title)}</a></h3><p>${escapeHtml(article.description)}</p></article>`).join('')}</div></section>`).join('')}
  </main>${footer('.')}<script src="app-shell.js"></script>
</body></html>`;
}

function render404() {
  return `${head({ title: 'الصفحة غير موجودة | نور', description: 'تعذر العثور على الصفحة المطلوبة.', canonical: `${SITE_URL}/404.html`, relative: '.', indexable: false, ads: false })}
<body class="knowledge-page"><main class="knowledge-shell methodology-shell"><header class="collection-hero"><span class="knowledge-eyebrow">خطأ 404</span><h1>هذه الصفحة غير موجودة</h1><p>قد يكون الرابط قديماً أو غير مكتمل. ارجع إلى الموسوعة أو استعمل البحث للوصول إلى الموضوع.</p><p><a class="method-link" href="articles.html">افتح موسوعة نور</a> <a class="method-link" href="index.html">العودة للرئيسية</a></p></header></main></body></html>`;
}

const xmlEscape = (value = '') => escapeHtml(value).replaceAll('&#039;', '&apos;');

function urlSet(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(({ url, lastmod }) => `  <url><loc>${xmlEscape(url)}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
}

function renderFeed() {
  const items = indexableArticles.map((article) => `<item><title>${xmlEscape(article.title)}</title><link>${SITE_URL}/library/${article.slug}.html</link><guid isPermaLink="true">${SITE_URL}/library/${article.slug}.html</guid><pubDate>${new Date(`${article.reviewedAt}T12:00:00Z`).toUTCString()}</pubDate><description>${xmlEscape(article.description)}</description></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>موسوعة نور</title><link>${SITE_URL}/articles.html</link><description>الملفات المعمقة الجديدة والمحدثة في موسوعة نور</description><language>ar</language><lastBuildDate>${new Date(`${REVIEW_DATE}T12:00:00Z`).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
}

function renderHomeLibrarySection() {
  const featured = [
    articles.find((article) => article.slug === 'yusuf-from-trial-to-trust'),
    articles.find((article) => article.slug === 'hijrah-planning-trust'),
    articles.find((article) => article.slug === 'how-to-read-tafsir'),
    articles.find((article) => article.slug === 'tawbah-repair')
  ];

  return `<section class="publisher-content library-home-expansion" aria-labelledby="publisherContentTitle">
      <div class="section-heading">
        <span>موسوعة عربية بمراجع معلنة</span>
        <h2 id="publisherContentTitle">${indexableArticles.length} ملفاً معمّقاً يقودك من المصدر إلى المعنى والعمل</h2>
        <p>نعرض الملفات التي اجتازت بوابة النشر بوضوح، ونبقي ${articles.length - indexableArticles.length} موجزاً خارج الفهرسة والإعلانات إلى أن تكتمل توسعتها. لكل ملف مواضع قرآنية مباشرة وحدود تحريرية ومستوى مراجعة معلن.</p>
      </div>
      <div class="home-category-links">
        ${categories.map((category) => `<a href="library/${category.slug}.html"><strong>${escapeHtml(category.name)}</strong><span>${articlesForCategory(category.slug).filter((article) => article.qualityTier === 'pillar').length} ملفات معمّقة</span></a>`).join('')}
      </div>
      <div class="article-preview-grid">
        ${featured.map((article) => `<article class="article-preview-card featured-spiritual-card">
          <span class="article-meta">${escapeHtml(categoryFor(article.category).name)} · مراجَع</span>
          <h3><a href="library/${article.slug}.html">${escapeHtml(article.title)}</a></h3>
          <p>${escapeHtml(article.description)}</p>
        </article>`).join('')}
      </div>
      <p class="section-cta"><a href="articles.html">ادخل إلى موسوعة نور الدينية</a></p>
    </section>`;
}

export async function generateLibrary(outDir) {
  const libraryDir = join(outDir, 'library');
  const authorsDir = join(outDir, 'authors');
  const sitemapsDir = join(outDir, 'sitemaps');
  await Promise.all([
    mkdir(libraryDir, { recursive: true }),
    mkdir(authorsDir, { recursive: true }),
    mkdir(sitemapsDir, { recursive: true })
  ]);

  await Promise.all([
    ...articles.map((article) => writeFile(join(libraryDir, `${article.slug}.html`), renderArticle(article))),
    ...categories.map((category) => writeFile(join(libraryDir, `${category.slug}.html`), renderCategory(category))),
    writeFile(join(outDir, 'articles.html'), renderIndex()),
    writeFile(join(outDir, 'sources.html'), renderSources()),
    writeFile(join(authorsDir, 'editorial-team.html'), renderEditorialTeam()),
    writeFile(join(outDir, 'corrections.html'), renderCorrections()),
    writeFile(join(outDir, 'sitemap.html'), renderHtmlSitemap()),
    writeFile(join(outDir, '404.html'), render404()),
    writeFile(join(outDir, 'feed.xml'), renderFeed())
  ]);

  const homePath = join(outDir, 'index.html');
  const currentHome = await readFile(homePath, 'utf8');
  const homeWithLibraryStyles = currentHome.includes('href="library.css"')
    ? currentHome
    : currentHome.replace('</head>', '  <link rel="stylesheet" href="library.css" />\n</head>');
  const expandedHome = homeWithLibraryStyles.replace(
    /<section class="publisher-content"[\s\S]*?<\/section>\s*(?=<section class="trust-strip")/,
    `${renderHomeLibrarySection()}\n    `
  );
  if (!expandedHome.includes('library-home-expansion')) {
    throw new Error('Could not find the homepage publisher-content section.');
  }
  await writeFile(homePath, expandedHome);

  const corePaths = [
    '', 'quran.html', 'adhkar.html', 'duas.html', 'salat.html', 'articles.html', 'journey.html',
    'guide-dua-etiquette.html', 'guide-adhkar-meaning.html', 'guide-contemplating-creation.html',
    'guide-gratitude.html', 'guide-daily-quran.html', 'guide-prayer-times.html', 'guide-privacy-offline.html',
    'editorial-policy.html', 'about.html', 'contact.html', 'privacy-policy.html', 'terms.html',
    'sources.html', 'authors/editorial-team.html', 'corrections.html', 'sitemap.html'
  ];
  const coreEntries = corePaths.map((path) => ({ url: `${SITE_URL}/${path}`, lastmod: REVIEW_DATE }));
  const encyclopediaEntries = [
    ...categories.map((category) => ({ url: `${SITE_URL}/library/${category.slug}.html`, lastmod: REVIEW_DATE })),
    ...indexableArticles.map((article) => ({ url: `${SITE_URL}/library/${article.slug}.html`, lastmod: article.reviewedAt }))
  ];
  await Promise.all([
    writeFile(join(sitemapsDir, 'core.xml'), urlSet(coreEntries)),
    writeFile(join(sitemapsDir, 'encyclopedia.xml'), urlSet(encyclopediaEntries)),
    writeFile(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE_URL}/sitemaps/core.xml</loc><lastmod>${REVIEW_DATE}</lastmod></sitemap>\n  <sitemap><loc>${SITE_URL}/sitemaps/encyclopedia.xml</loc><lastmod>${REVIEW_DATE}</lastmod></sitemap>\n</sitemapindex>\n`)
  ]);

  console.log(`Generated ${indexableArticles.length} indexed pillar files, ${articles.length - indexableArticles.length} noindex briefs, ${categories.length} hubs, and split sitemaps.`);
}
