const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile, stat } = require('node:fs/promises');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const rootDir = join(__dirname, '..');

test('religious library has a substantial, uniquely addressed catalog', async () => {
  const { articles, categories } = await import('../content/library-data.mjs');
  const slugs = articles.map((article) => article.slug);

  assert.ok(articles.length >= 50, 'expected at least 50 original foundation articles');
  assert.equal(new Set(slugs).size, slugs.length, 'article slugs must be unique');
  assert.ok(categories.length >= 4);
  assert.ok(categories.every((category) =>
    articles.filter((article) => article.category === category.slug).length >= 5));
});

test('every article declares Quran locations, references, review date, and substantive sections', async () => {
  const { articles, sources } = await import('../content/library-data.mjs');

  for (const article of articles) {
    assert.ok(article.description.length >= 70, `${article.slug}: description is too short`);
    assert.ok(article.quranRefs.length >= 1, `${article.slug}: missing Quran reference`);
    assert.ok(article.sections.length >= 3, `${article.slug}: missing sections`);
    assert.ok(article.sections.every(([heading, paragraph]) =>
      heading.length >= 8 && paragraph.length >= 100), `${article.slug}: thin section`);
    assert.ok(article.sourceKeys.length >= 2, `${article.slug}: not enough sources`);
    assert.ok(article.sourceKeys.every((key) => sources[key]?.url.startsWith('https://')),
      `${article.slug}: invalid source`);
    assert.match(article.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(article.reviewLevel, /لا تُعد مراجعة شرعية متخصصة/);
  }
});

test('the 200-topic roadmap stays private until every topic passes the publication gate', async () => {
  const { editorialRoadmap, publicationGate } = await import('../content/editorial-roadmap.mjs');
  const ids = editorialRoadmap.map((topic) => topic.id);

  assert.equal(editorialRoadmap.length, 200);
  assert.equal(new Set(ids).size, ids.length, 'roadmap IDs must be unique');
  assert.ok(editorialRoadmap.every((topic) => topic.status === 'planned' && topic.indexable === false));
  assert.ok(publicationGate.length >= 7);
});

test('website build generates discoverable pages, structured data, and a complete sitemap', async () => {
  const result = spawnSync(process.execPath, ['scripts/build-web.mjs'], {
    cwd: rootDir,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const { articles, categories } = await import('../content/library-data.mjs');
  const samplePath = join(rootDir, 'dist', 'library', `${articles[0].slug}.html`);
  const sample = await readFile(samplePath, 'utf8');
  const sitemap = await readFile(join(rootDir, 'dist', 'sitemap.xml'), 'utf8');
  const index = await readFile(join(rootDir, 'dist', 'articles.html'), 'utf8');
  const home = await readFile(join(rootDir, 'dist', 'index.html'), 'utf8');
  const author = await readFile(join(rootDir, 'dist', 'authors', 'editorial-team.html'), 'utf8');

  assert.match(sample, /"@type":"Article"/);
  assert.match(sample, /المراجع المستخدمة/);
  assert.match(sample, /اقرأ بعد ذلك/);
  assert.match(sample, /"@type":"FAQPage"/);
  assert.match(sample, /حالة المراجعة بشفافية/);
  assert.match(sample, /class="inline-citation"/);
  assert.match(sample, /فريق تحرير نور/);
  assert.match(index, /data-library-card/);
  assert.match(index, new RegExp(`${articles.length}.*مقالة أصلية منشورة`, 's'));
  assert.match(home, /library-home-expansion/);
  assert.match(home, /href="library\.css"/);
  assert.match(author, /لا ندّعي مراجعة شرعية خارجية غير موجودة/);
  assert.match(sitemap, /\/authors\/editorial-team\.html/);

  const visibleText = sample
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  assert.ok(visibleText.split(/\s+/).length >= 500, 'generated article is still too thin');

  for (const article of articles) {
    assert.match(sitemap, new RegExp(`/library/${article.slug}\\.html`));
    await stat(join(rootDir, 'dist', 'library', `${article.slug}.html`));
  }
  for (const category of categories) {
    assert.match(sitemap, new RegExp(`/library/${category.slug}\\.html`));
  }
});

test('Android web build keeps the original compact library and excludes generated website pages', async () => {
  const result = spawnSync(process.execPath, ['scripts/build-web.mjs', '--android'], {
    cwd: rootDir,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const androidLibrary = await readFile(join(rootDir, 'dist', 'articles.html'), 'utf8');
  assert.match(androidLibrary, /7<\/strong><span>أدلة أصلية/);
  await assert.rejects(stat(join(rootDir, 'dist', 'library', 'quran-stories.html')));
});
