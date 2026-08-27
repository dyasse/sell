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
    if (count < 500) failures.push(`${label}: thin rendered page (${count} words)`);
    if (!html.includes('"@type":"Article"')) failures.push(`${label}: missing Article schema`);
    if (!html.includes('"@type":"FAQPage"')) failures.push(`${label}: missing FAQ schema`);
    if (!html.includes('حالة المراجعة بشفافية')) failures.push(`${label}: missing review disclosure`);
  }
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
  console.log(`Library audit passed: ${articles.length} articles, ${categories.length} hubs, ${encyclopediaFiles.length} HTML pages, ${editorialRoadmap.length} gated topics.`);
}

