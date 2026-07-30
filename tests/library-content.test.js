const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile, stat } = require('node:fs/promises');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const rootDir = join(__dirname, '..');

test('religious library has a substantial, uniquely addressed catalog', async () => {
  const { articles, categories } = await import('../content/library-data.mjs');
  const slugs = articles.map((article) => article.slug);

  assert.ok(articles.length >= 30, 'expected at least 30 original library articles');
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
  }
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

  assert.match(sample, /"@type":"Article"/);
  assert.match(sample, /المراجع المستخدمة/);
  assert.match(sample, /اقرأ بعد ذلك/);
  assert.match(index, /data-library-card/);
  assert.match(home, /library-home-expansion/);
  assert.match(home, /href="library\.css"/);

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
