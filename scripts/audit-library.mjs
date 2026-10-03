import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { articles, categories } from '../content/library-data.mjs';
import { editorialRoadmap } from '../content/editorial-roadmap.mjs';

const root = process.cwd();
const dist = join(root, 'dist');
const failures = [];

const listHtml = async (dir) => {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listHtml(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
};

const exists = async (path) => {
  try { await access(path); return true; } catch { return false; }
};

const articleSlugs = new Set(articles.map((article) => article.slug));
const pillarArticles = articles.filter((article) => article.qualityTier === 'pillar');
const briefArticles = articles.filter((article) => article.qualityTier !== 'pillar');
const categorySlugs = new Set(categories.map((category) => category.slug));
const encyclopediaFiles = [
  join(dist, 'articles.html'),
  join(dist, 'sources.html'),
  join(dist, 'authors', 'editorial-team.html'),
  ...await listHtml(join(dist, 'library'))
];

const titles = new Map();
const canonicals = new Map();

for (const file of encyclopediaFiles) {
  const html = await readFile(file, 'utf8');
  const label = relative(dist, file);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];

  if (!title) failures.push(`${label}: missing title`);
  else if (titles.has(title)) failures.push(`${label}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, label);

  if (!canonical) failures.push(`${label}: missing canonical`);
  else if (canonicals.has(canonical)) failures.push(`${label}: duplicate canonical with ${canonicals.get(canonical)}`);
  else canonicals.set(canonical, label);

  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json[1]); } catch (error) { failures.push(`${label}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const clean = href.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.endsWith('/') ? join(dist, clean, 'index.html') : resolve(dirname(file), clean);
    if (!normalize(target).startsWith(normalize(dist)) || !await exists(target)) {
      failures.push(`${label}: broken internal link ${href}`);
    }
  }

  if (label.startsWith('library/') && articleSlugs.has(label.replace(/^library\//, '').replace(/\.html$/, ''))) {
    const text = html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const count = text.split(/\s+/).length;
    const article = articles.find((item) => item.slug === label.replace(/^library\//, '').replace(/\.html$/, ''));
    if (article?.qualityTier === 'pillar') {
      if (article.sections.length < 5) failures.push(`${label}: pillar has fewer than five substantive sections`);
      // Guardrail only; Google has no preferred word count. Six distinct sections and
      // claim-level citations are the primary publication gate.
      if (count < 750) failures.push(`${label}: pillar is unexpectedly thin (${count} rendered words)`);
      if (!html.includes('"@type":"Article"')) failures.push(`${label}: missing Article schema`);
      if (!html.includes('"@type":"FAQPage"')) failures.push(`${label}: missing FAQ schema`);
      if (!html.includes('index,follow,max-image-preview:large')) failures.push(`${label}: pillar is not explicitly indexable`);
      if (!html.includes('quranenc.com/ar/browse/arabic_moyassar/')) failures.push(`${label}: missing exact QuranEnc citation`);
      if (!html.includes('quran.ksu.edu.sa/tafseer/saadi/')) failures.push(`${label}: missing exact KSU tafsir citation`);
    } else if (article) {
      if (!html.includes('name="robots" content="noindex,follow"')) failures.push(`${label}: brief must be noindex`);
      if (html.includes('pagead2.googlesyndication.com')) failures.push(`${label}: brief must be ad-free`);
      if (html.includes('"@type":"Article"')) failures.push(`${label}: brief must not claim indexable Article schema`);
    }
    if (!html.includes('حالة المراجعة بشفافية')) failures.push(`${label}: missing review disclosure`);
  }
}

const sitemapIndex = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const encyclopediaSitemap = await readFile(join(dist, 'sitemaps', 'encyclopedia.xml'), 'utf8');
if (!sitemapIndex.includes('<sitemapindex')) failures.push('sitemap.xml: expected a sitemap index');
for (const article of pillarArticles) {
  if (!encyclopediaSitemap.includes(`/library/${article.slug}.html`)) failures.push(`sitemap: missing pillar ${article.slug}`);
}
for (const article of briefArticles) {
  if (encyclopediaSitemap.includes(`/library/${article.slug}.html`)) failures.push(`sitemap: noindex brief leaked ${article.slug}`);
}
for (const required of ['corrections.html', 'sitemap.html', 'feed.xml', '404.html']) {
  if (!await exists(join(dist, required))) failures.push(`missing generated trust/discovery file: ${required}`);
}

for (const topic of editorialRoadmap) {
  if (articleSlugs.has(topic.id) || categorySlugs.has(topic.id)) {
    failures.push(`planned topic leaked into the public catalog: ${topic.id}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Library audit passed: ${pillarArticles.length} indexed pillars, ${briefArticles.length} noindex/ad-free briefs, ${categories.length} hubs, split sitemaps, ${editorialRoadmap.length} gated topics.`);
}
