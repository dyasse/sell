import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  SITE_IMAGE,
  SITE_LANGUAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_PUBLISHER_ID,
  SITE_URL,
  coreSeoPages
} from '../content/seo-pages.mjs';

const jsonLd = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function stripSeoTags(html) {
  return html
    .replace(/\s*<meta\s+name=["'](?:description|robots|author|twitter:card|twitter:title|twitter:description|twitter:image)["'][^>]*\/?>/gi, '')
    .replace(/\s*<meta\s+property=["'](?:og:type|og:locale|og:site_name|og:title|og:description|og:url|og:image|og:image:alt|article:published_time|article:modified_time|article:section)["'][^>]*\/?>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*\/?>/gi, '')
    .replace(/\s*<link\s+rel=["']alternate["']\s+type=["']application\/rss\+xml["'][^>]*\/?>/gi, '');
}

function schemaFor(page) {
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${SITE_URL}/` }
  ];
  if (page.path !== 'index.html') {
    if (page.schemaType === 'Article') {
      breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: 'المسارات', item: `${SITE_URL}/journey.html` });
      breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: page.title.replace(/\s*\|.*$/, ''), item: page.canonical });
    } else {
      breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: page.section || page.title, item: page.canonical });
    }
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems
  };

  if (page.schemaType === 'SoftwareApplication') return [breadcrumb];

  if (page.schemaType === 'Article') {
    return [{
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.title.replace(/\s*\|.*$/, ''),
      description: page.description,
      inLanguage: SITE_LANGUAGE,
      datePublished: page.published,
      dateModified: page.modified,
      author: { '@type': 'Organization', name: 'فريق تحرير نور', url: `${SITE_URL}/authors/editorial-team.html` },
      publisher: { '@id': SITE_PUBLISHER_ID },
      mainEntityOfPage: page.canonical,
      image: SITE_IMAGE,
      articleSection: page.section,
      isAccessibleForFree: true
    }, breadcrumb];
  }

  if (page.schemaType === 'ProfilePage') {
    return [{
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: page.title.replace(/\s*\|.*$/, ''),
      url: page.canonical,
      dateModified: page.modified,
      mainEntity: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#editorial-team`,
        name: 'فريق تحرير نور',
        url: page.canonical,
        parentOrganization: { '@id': SITE_PUBLISHER_ID }
      }
    }, breadcrumb];
  }

  return [{
    '@context': 'https://schema.org',
    '@type': page.schemaType,
    name: page.title.replace(/\s*\|.*$/, ''),
    description: page.description,
    url: page.canonical,
    inLanguage: SITE_LANGUAGE,
    dateModified: page.modified,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': SITE_PUBLISHER_ID }
  }, breadcrumb];
}

function seoBlock(page) {
  const title = escapeAttribute(page.title);
  const description = escapeAttribute(page.description);
  const imageAlt = escapeAttribute('شعار نور للقرآن والموسوعة الإسلامية');
  const articleMeta = page.schemaType === 'Article'
    ? `\n  <meta property="article:published_time" content="${page.published}" />\n  <meta property="article:modified_time" content="${page.modified}" />\n  <meta property="article:section" content="${escapeAttribute(page.section)}" />`
    : '';
  const schemas = schemaFor(page)
    .map((schema) => `  <script type="application/ld+json" data-nour-seo>${jsonLd(schema)}</script>`)
    .join('\n');

  return `
  <meta name="description" content="${description}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta name="author" content="فريق تحرير نور" />
  <link rel="canonical" href="${page.canonical}" />
  <link rel="alternate" type="application/rss+xml" title="موسوعة نور" href="${SITE_URL}/feed.xml" />
  <meta property="og:type" content="${page.schemaType === 'Article' ? 'article' : 'website'}" />
  <meta property="og:locale" content="${SITE_LOCALE}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${page.canonical}" />
  <meta property="og:image" content="${SITE_IMAGE}" />
  <meta property="og:image:alt" content="${imageAlt}" />${articleMeta}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${SITE_IMAGE}" />
${schemas}`;
}

export async function enhanceStaticSeo(outDir) {
  for (const page of coreSeoPages) {
    const filePath = join(outDir, page.path);
    let html = await readFile(filePath, 'utf8');
    html = stripSeoTags(html)
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(page.title)}</title>`)
      .replace(/\s*<script\s+type=["']application\/ld\+json["']\s+data-nour-seo[^>]*>[\s\S]*?<\/script>/gi, '');
    if (!html.includes('</head>')) throw new Error(`${page.path}: missing </head>`);
    html = html.replace('</head>', `${seoBlock(page)}\n</head>`);
    await writeFile(filePath, html);
  }
  console.log(`Enhanced technical SEO for ${coreSeoPages.length} core pages.`);
}
