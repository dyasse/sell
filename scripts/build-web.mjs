import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const rootDir = process.cwd();
const outDir = join(rootDir, 'dist');

const excluded = new Set([
  '.git',
  '.github',
  '.idea',
  '.vscode',
  'android',
  'ci',
  'coverage',
  'dist',
  'node_modules',
  'scripts',
  'src',
  'tests',
  'package.json',
  'package-lock.json',
  'capacitor.config.json',
  'vercel.json',
  'README.md',
  'SECURITY.md',
  'LICENSE_NOTE.md',
  'report.json'
]);

const placeholderKeys = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID',
  'AD_CLIENT_ID',
  'AD_SLOT_ID',
  'ADS_PUBLISHER_ID',
  'ADMOB_APP_ID',
  'ADMOB_BANNER_AD_UNIT_ID',
  'GA_MEASUREMENT_ID',
  'PAYPAL_CLIENT_ID',
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  'QURAN_API_URL',
  'QURAN_CHAPTERS_API_URL',
  'QURAN_AUDIO_BASE_URL'
];

const injectableExtensions = new Set(['.html', '.js', '.json', '.txt', '.xml']);

function extensionOf(filePath) {
  const dotIndex = filePath.lastIndexOf('.');
  return dotIndex === -1 ? '' : filePath.slice(dotIndex);
}

async function injectPlaceholders(dir) {
  for (const entry of await readdir(dir)) {
    const filePath = join(dir, entry);
    const info = await stat(filePath);

    if (info.isDirectory()) {
      await injectPlaceholders(filePath);
      continue;
    }

    if (!injectableExtensions.has(extensionOf(filePath))) continue;

    let contents = await readFile(filePath, 'utf8');
    let changed = false;

    for (const key of placeholderKeys) {
      const value = process.env[key];
      if (!value) continue;

      const nextContents = contents.replaceAll(`{{${key}}}`, value);
      changed ||= nextContents !== contents;
      contents = nextContents;
    }

    if (changed) {
      await writeFile(filePath, contents);
    }
  }
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of await readdir(rootDir)) {
  if (excluded.has(entry)) continue;

  await cp(join(rootDir, entry), join(outDir, entry), {
    recursive: true,
    force: true
  });
}

await injectPlaceholders(outDir);

console.log('Web build completed: dist/');
