const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const publicDir = join(root, 'android/app/src/main/assets/public');

function readPublic(file) {
  return readFileSync(join(publicDir, file), 'utf8');
}

test('service worker does not cache full Quran audio files', () => {
  const sw = readPublic('sw.js');
  assert.match(sw, /isAudioFileRequest/);
  assert.match(sw, /Do not cache full Quran audio files/);
  assert.match(sw, /event\.respondWith\(fetch\(request\)\)/);
});

test('location permission prominent disclosure exists and auto-request is disabled', () => {
  const salatHtml = readPublic('salat.html');
  const salatJs = readPublic('salat.js');

  assert.match(salatHtml, /Nour Quran uses your location to calculate prayer times and qibla direction\. Location is not sold\./);
  assert.doesNotMatch(salatJs, /DOMContentLoaded[^]*locateUser\(\)/);
  assert.match(salatJs, /enableHighAccuracy:\s*false/);
});

test('legal pages required for Play review are present in web output source', () => {
  ['privacy-policy.html', 'terms.html', 'license.html', 'delete-account.html'].forEach((file) => {
    assert.equal(existsSync(join(publicDir, file)), true, `${file} should exist`);
  });
});

test('release docs mark unverified Quran provider licenses as blockers', () => {
  const licenseNote = readFileSync(join(root, 'LICENSE_NOTE.md'), 'utf8');
  assert.match(licenseNote, /RELEASE_BLOCKER/);
  assert.match(licenseNote, /UNVERIFIED/);
  assert.match(licenseNote, /QuranicAudio/);
});

test('Supabase service-role keys are not present in frontend config', () => {
  const auth = readPublic('auth.js');
  const config = readPublic('supabase-config.js');

  assert.doesNotMatch(auth + config, /service_role/i);
  assert.match(auth, /\{\{SUPABASE_URL\}\}/);
  assert.match(auth, /\{\{SUPABASE_ANON_KEY\}\}/);
});
