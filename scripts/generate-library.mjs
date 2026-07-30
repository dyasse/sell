import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  SITE_URL,
  REVIEW_DATE,
  articles,
  articlesForCategory,
  categories,
  categoryFor,
  sources
} from '../content/library-data.mjs';

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

function head({ title, description, canonical, relative = '..', type = 'website', schema = [] }) {
  const schemaMarkup = schema.map((item) =>
    `<script type="application/ld+json">${jsonLd(item)}</script>`).join('\n  ');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="نور" />
  <meta property="og:locale" content="ar_AR" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="theme-color" content="#1f6f50" />
  <meta name="google-adsense-account" content="ca-pub-2350255696934759" />
  <link rel="icon" href="${relative}/assets/favicon.png" />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${relative}/styles.css" />
  <link rel="stylesheet" href="${relative}/library.css" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2350255696934759" crossorigin="anonymous"></script>
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
    <a href="${relative}/privacy-policy.html">الخصوصية</a>
  </footer>`;
}

function articleCard(article, relative = '.') {
  const category = categoryFor(article.category);
  return `<article class="knowledge-card" data-library-card data-search="${escapeHtml(`${article.title} ${article.description} ${category.name}`)}">
    <span class="knowledge-card__category">${escapeHtml(category.name)}</span>
    <h3><a href="${relative}/library/${article.slug}.html">${escapeHtml(article.title)}</a></h3>
    <p>${escapeHtml(article.description)}</p>
    <div class="knowledge-card__meta"><span>${article.quranRefs.length} مواضع قرآنية</span><span>مراجَع ${formatDate(article.reviewedAt)}</span></div>
    <a class="knowledge-card__link" href="${relative}/library/${article.slug}.html">اقرأ المقالة <span aria-hidden="true">←</span></a>
  </article>`;
}

function renderArticle(article) {
  const category = categoryFor(article.category);
  const canonical = `${SITE_URL}/library/${article.slug}.html`;
  const categoryArticles = articlesForCategory(article.category);
  const currentIndex = categoryArticles.findIndex((item) => item.slug === article.slug);
  const related = [1, 2, 3].map((offset) =>
    categoryArticles[(currentIndex + offset) % categoryArticles.length]).filter((item) => item.slug !== article.slug);
  const usedSources = article.sourceKeys.map((key) => sources[key]);
  const wordCount = [
    article.description,
    ...article.sections.flatMap((section) => section)
  ].join(' ').split(/\s+/).length;
  const readingTime = Math.max(5, Math.ceil(wordCount / 110));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    inLanguage: 'ar',
    datePublished: REVIEW_DATE,
    dateModified: article.reviewedAt,
    author: { '@type': 'Organization', name: 'فريق نور', url: `${SITE_URL}/about.html` },
    publisher: { '@type': 'Organization', name: 'نور', url: SITE_URL },
    mainEntityOfPage: canonical,
    articleSection: category.name
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

  return `${head({
    title: `${article.title} | مكتبة نور`,
    description: article.description,
    canonical,
    type: 'article',
    schema: [articleSchema, breadcrumbSchema]
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
          <span>إعداد ومراجعة: فريق نور</span><span>آخر مراجعة: ${formatDate(article.reviewedAt)}</span><span>${readingTime} دقائق</span>
        </div>
      </header>
      <aside class="source-boundary" aria-label="حدود المقالة">
        <strong>كيف تقرأ هذه الصفحة؟</strong>
        <p>مواضع القرآن أدناه هي المصدر الأول. أما العناوين والشرح والدروس فهي صياغة تحريرية تعليمية من فريق نور، وليست نصاً من القرآن ولا فتوى شخصية.</p>
      </aside>
      <section class="quran-reference-box" aria-labelledby="quranRefs">
        <h2 id="quranRefs">مواضع القصة أو الموضوع في القرآن</h2>
        <ul>${article.quranRefs.map((ref) => `<li>${escapeHtml(ref)}</li>`).join('')}</ul>
        <p>يُنصح بقراءة المقطع كاملاً من <a href="../quran.html">مصحف نور</a> أو من مصحف موثوق قبل قراءة الشرح.</p>
      </section>
      <div class="knowledge-article__body">
        ${article.sections.map(([heading, paragraph]) =>
          `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(paragraph)}</p></section>`).join('')}
        <section>
          <h2>وقفة عملية</h2>
          <p>بعد قراءة المواضع، اكتب بجملة واحدة المعنى الذي يراجع سلوكاً واقعياً لديك، ثم اختر عملاً صغيراً قابلاً للقياس. لا تستخرج حكماً شرعياً جديداً من الخاطر الشخصي، وارجع إلى عالم مؤهل في الفتوى والنوازل.</p>
        </section>
      </div>
      <section class="article-sources" aria-labelledby="articleSources">
        <h2 id="articleSources">المراجع المستخدمة</h2>
        <p>هذه الروابط للتثبت والتوسع. لا يعني ذكر المرجع أن مؤسسة خارجية راجعت مقالة نور أو تزكي جميع محتواها.</p>
        <ul>${usedSources.map((source) =>
          `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a><span>${escapeHtml(source.detail)}</span></li>`).join('')}</ul>
        <a class="method-link" href="../sources.html">اطلع على منهجية التوثيق كاملة</a>
      </section>
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
  const canonical = `${SITE_URL}/library/${category.slug}.html`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: canonical,
    inLanguage: 'ar',
    hasPart: categoryArticles.map((article) => ({
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
      <div class="collection-count">${categoryArticles.length} مقالة موثقة</div>
    </header>
    <section class="knowledge-grid" aria-label="مقالات ${escapeHtml(category.name)}">
      ${categoryArticles.map((article) => articleCard(article, '..')).join('')}
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
    inLanguage: 'ar'
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
        <span class="knowledge-eyebrow">موسوعة نور الدينية</span>
        <h1>معرفة موثقة تقرّب المعنى إلى الحياة</h1>
        <p>قصص من القرآن، محطات من السيرة، مفاتيح للفهم، وأدلة تربوية أصلية. نعلن المصدر، ونفصل بين النص والشرح، ونراجع الصفحات بتاريخ واضح.</p>
        <div class="library-search"><label for="librarySearch">ابحث في المكتبة</label><input id="librarySearch" type="search" placeholder="مثال: يوسف، التوبة، التفسير…" autocomplete="off" /></div>
      </div>
      <dl class="library-metrics">
        <div><dt>${articles.length}</dt><dd>مقالة جديدة</dd></div>
        <div><dt>${categories.length}</dt><dd>أبواب رئيسية</dd></div>
        <div><dt>100%</dt><dd>مراجع معلنة</dd></div>
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
      <p>لكل مقالة مواضع قرآنية محددة، ومراجع خارجية معلنة، وتاريخ مراجعة. نستقبل التصحيحات ولا نقدم المقالات العامة بوصفها فتوى.</p>
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
      <article><span>05</span><h2>مراجعة وتصحيح</h2><p>تحمل كل صفحة تاريخ مراجعة. عند ثبوت خطأ نصححه ونراجع الصفحات المرتبطة به، ويمكن الإبلاغ عبر صفحة التواصل.</p></article>
      <article><span>06</span><h2>روابط آمنة</h2><p>الروابط الخارجية تفتح بشكل منفصل مع حماية تقنية، ونصف سبب استخدامها. ذكر المصدر لا يعني أنه راجع منصة نور أو يزكيها.</p></article>
    </section>
    <section class="reference-directory" aria-labelledby="referenceTitle">
      <h2 id="referenceTitle">دليل المراجع الأساسية</h2>
      <div>${Object.values(sources).filter((source, index, all) =>
        all.findIndex((item) => item.url === source.url && item.name === source.name) === index).map((source) =>
          `<article><h3><a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a></h3><p>${escapeHtml(source.detail)}</p><span>مرجع خارجي موثوق للتثبت والتوسع</span></article>`).join('')}</div>
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

function renderHomeLibrarySection() {
  const featured = [
    articles.find((article) => article.slug === 'yusuf-from-trial-to-trust'),
    articles.find((article) => article.slug === 'hijrah-planning-trust'),
    articles.find((article) => article.slug === 'how-to-read-tafsir'),
    articles.find((article) => article.slug === 'tawbah-repair')
  ];

  return `<section class="publisher-content library-home-expansion" aria-labelledby="publisherContentTitle">
      <div class="section-heading">
        <span>موسوعة دينية بمراجع معلنة</span>
        <h2 id="publisherContentTitle">33 مقالة جديدة تقودك من القصة إلى المعنى والعمل</h2>
        <p>تصفّح قصص القرآن والسيرة ومفاتيح الفهم والإيمان والأخلاق. لكل صفحة مواضع قرآنية، وحدود تحريرية، ومراجع، وروابط للقراءة التالية.</p>
      </div>
      <div class="home-category-links">
        ${categories.map((category) => `<a href="library/${category.slug}.html"><strong>${escapeHtml(category.name)}</strong><span>${articlesForCategory(category.slug).length} مقالة</span></a>`).join('')}
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
  await mkdir(libraryDir, { recursive: true });

  await Promise.all([
    ...articles.map((article) => writeFile(join(libraryDir, `${article.slug}.html`), renderArticle(article))),
    ...categories.map((category) => writeFile(join(libraryDir, `${category.slug}.html`), renderCategory(category))),
    writeFile(join(outDir, 'articles.html'), renderIndex()),
    writeFile(join(outDir, 'sources.html'), renderSources())
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

  const sitemapPath = join(outDir, 'sitemap.xml');
  const currentSitemap = await readFile(sitemapPath, 'utf8');
  const generatedUrls = [
    `${SITE_URL}/sources.html`,
    ...categories.map((category) => `${SITE_URL}/library/${category.slug}.html`),
    ...articles.map((article) => `${SITE_URL}/library/${article.slug}.html`)
  ];
  const entries = generatedUrls.map((url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${REVIEW_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${url.includes('/library/') ? '0.72' : '0.70'}</priority>
  </url>`).join('\n');
  await writeFile(sitemapPath, currentSitemap.replace('</urlset>', `${entries}\n</urlset>`));

  console.log(`Generated ${articles.length} library articles, ${categories.length} category hubs, and the methodology page.`);
}
