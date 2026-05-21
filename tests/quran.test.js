const test = require('node:test');
const assert = require('node:assert/strict');
const { parseAyah, search, buildSurahAudioUrl, escapeHtml } = require('../android/app/src/main/assets/public/quran.js');

test('parseAyah returns object with sura, ayah, and text', () => {
  const out = parseAyah('1:1 Bismillah ar-Rahman ar-Rahim');

  assert.deepEqual(out, {
    sura: 1,
    ayah: 1,
    text: 'Bismillah ar-Rahman ar-Rahim'
  });
});

test('search returns expected sura and ayah indices for a keyword', () => {
  const dataset = [
    parseAyah('1:1 Bismillah ar-Rahman ar-Rahim'),
    parseAyah('2:255 Allahu la ilaha illa huwa')
  ];

  const results = search('Bismillah', dataset);

  assert.equal(results.length, 1);
  assert.equal(results[0].sura, 1);
  assert.equal(results[0].ayah, 1);
  assert.equal(results[0].index, 0);
});

test('buildSurahAudioUrl normalizes valid surah numbers to https mp3 URLs', () => {
  assert.equal(
    buildSurahAudioUrl(1),
    'https://download.quranicaudio.com/quran/fahad_alkandari/001.mp3'
  );
  assert.equal(buildSurahAudioUrl(115), '');
});

test('escapeHtml protects Quran and tafsir UI rendering from injected markup', () => {
  assert.equal(
    escapeHtml('<img src=x onerror=alert(1)> & "quote"'),
    '&lt;img src=x onerror=alert(1)&gt; &amp; &quot;quote&quot;'
  );
});
