import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { coreSeoPages, SITE_IMAGE, SITE_URL } from '../content/seo-pages.mjs';

const root = process.cwd();
const dist = join(root, 'dist');
const failures = [];
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

const exists = async (filePath) => {
  try { await access(filePath); return true; } catch { return false; }
};

const count = (html, expression) => [...html.matchAll(expression)].length;

const listHtml = async (dir) => {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const filePath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listHtml(filePath));
    else if (entry.name.endsWith('.html')) files.push(filePath);
  }
  return files;
};

const coreSitemap = await readFile(join(dist, 'sitemaps', 'core.xml'), 'utf8');
const encyclopediaSitemap = await readFile(join(dist, 'sitemaps', 'encyclopedia.xml'), 'utf8');
const sitemapIndex = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const allSitemaps = `${coreSitemap}\n${encyclopediaSitemap}`;

if (!sitemapIndex.includes(`${SITE_URL}/sitemaps/core.xml`)) failures.push('sitemap.xml: missing core sitemap');
if (!sitemapIndex.includes(`${SITE_URL}/sitemaps/encyclopedia.xml`)) failures.push('sitemap.xml: missing encyclopedia sitemap');

for (const page of coreSeoPages) {
  const filePath = join(dist, page.path);
  if (!await exists(filePath)) {
    failures.push(`${page.path}: missing build output`);
    continue;
  }
  const html = await readFile(filePath, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];

  if (title !== page.title) failures.push(`${page.path}: title does not match SEO registry`);
  if (description !== page.description) failures.push(`${page.path}: description does not match SEO registry`);
  if (canonical !== page.canonical) failures.push(`${page.path}: canonical does not match SEO registry`);
  if (title && titles.has(title)) failures.push(`${page.path}: duplicate title with ${titles.get(title)}`);
  if (description && descriptions.has(description)) failures.push(`${page.path}: duplicate description with ${descriptions.get(description)}`);
  if (canonical && canonicals.has(canonical)) failures.push(`${page.path}: duplicate canonical with ${canonicals.get(canonical)}`);
  if (title) titles.set(title, page.path);
  if (description) descriptions.set(description, page.path);
  if (canonical) canonicals.set(canonical, page.path);

  if (count(html, /<meta\s+name="robots"/gi) !== 1) failures.push(`${page.path}: expected exactly one robots meta tag`);
  if (count(html, /<link\s+rel="canonical"/gi) !== 1) failures.push(`${page.path}: expected exactly one canonical`);
  if (count(html, /<h1\b/gi) !== 1) failures.push(`${page.path}: expected exactly one h1`);
  if (!html.includes('index,follow,max-image-preview:large')) failures.push(`${page.path}: missing indexable robots policy`);

  for (const required of [
    'og:type', 'og:locale', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt',
    'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'
  ]) {
    if (!html.includes(`"${required}"`)) failures.push(`${page.path}: missing ${required}`);
  }
  if (!html.includes(`content="${SITE_IMAGE}"`)) failures.push(`${page.path}: social image is not the verified site image`);

  const schemaTypes = [];
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const schema = JSON.parse(match[1]);
      if (schema['@type']) schemaTypes.push(schema['@type']);
      if (schema['@graph']) schemaTypes.push(...schema['@graph'].map((item) => item['@type']).filter(Boolean));
    } catch (error) {
      failures.push(`${page.path}: invalid JSON-LD (${error.message})`);
    }
  }
  if (!schemaTypes.includes(page.schemaType)) failures.push(`${page.path}: missing ${page.schemaType} schema`);
  if (!schemaTypes.includes('BreadcrumbList')) failures.push(`${page.path}: missing BreadcrumbList schema`);
  if (page.schemaType === 'Article' && !html.includes(`"dateModified":"${page.modified}"`)) {
    failures.push(`${page.path}: Article dateModified is stale`);
  }

  const sitemapEntry = `<loc>${page.canonical}</loc><lastmod>${page.modified}</lastmod>`;
  if (!coreSitemap.includes(sitemapEntry)) failures.push(`${page.path}: missing accurate sitemap entry`);
}

if (!await exists(join(dist, new URL(SITE_IMAGE).pathname))) failures.push('verified social image is missing from build output');

for (const filePath of await listHtml(dist)) {
  const html = await readFile(filePath, 'utf8');
  const label = relative(dist, filePath);
  const noindex = /<meta\s+name="robots"\s+content="noindex,follow"/i.test(html);
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (noindex && canonical && allSitemaps.includes(`<loc>${canonical}</loc>`)) {
    failures.push(`${label}: noindex URL leaked into sitemap`);
  }
  if (count(html, /<meta\s+name="robots"/gi) > 1) failures.push(`${label}: duplicate robots meta tags`);

  for (const match of html.matchAll(/<(?:a|link)\s+[^>]*href="([^"]+)"[^>]*>/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(href)) continue;
    const clean = href.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.startsWith('/') ? join(dist, clean) : resolve(dirname(filePath), clean);
    if (!normalize(target).startsWith(normalize(dist)) || !await exists(target)) failures.push(`${label}: broken internal href ${href}`);
  }
  for (const match of html.matchAll(/<(?:img|script)\s+[^>]*src="([^"]+)"[^>]*>/gi)) {
    const src = match[1];
    if (/^(?:https?:|data:|capacitor:)/i.test(src)) continue;
    const clean = src.split(/[?#]/)[0];
    if (!clean || (extname(clean) === '' && clean.startsWith('{{'))) continue;
    const target = clean.startsWith('/') ? join(dist, clean) : resolve(dirname(filePath), clean);
    if (!normalize(target).startsWith(normalize(dist)) || !await exists(target)) failures.push(`${label}: missing local asset ${src}`);
  }
}

const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) failures.push('robots.txt: missing absolute sitemap URL');
if (/Disallow:\s*\/(?:css|js)/i.test(robots)) failures.push('robots.txt: blocks render resources');

if (failures.length) {
  console.error([...new Set(failures)].join('\n'));
  process.exitCode = 1;
} else {
  console.log(`SEO audit passed: ${coreSeoPages.length} core pages, unique metadata, valid schemas, accurate sitemaps, and crawlable internal links.`);
}
