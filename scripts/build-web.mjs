import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';

const rootDir = process.cwd();
const outDir = join(rootDir, 'dist');
const isAndroidBuild = process.argv.includes('--android');

const excludedRoots = new Set([
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
  'tests'
]);

const excludedFiles = new Set([
  'package.json',
  'package-lock.json',
  'capacitor.config.json',
  'vercel.json',
  'README.md',
  'SECURITY.md',
  'LICENSE_NOTE.md',
  'report.json',
  '.env.example',
  'products.json'
]);

const webAssetExtensions = new Set([
  '.html', '.js', '.mjs', '.css', '.json', '.txt', '.xml',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.map'
]);

const requiredDistFiles = ['index.html', 'styles.css', 'script.js'];

const placeholderKeys = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'AD_CLIENT_ID',
  'AD_SLOT_ID',
  'ADS_PUBLISHER_ID',
  'ADMOB_APP_ID',
  'ADMOB_BANNER_AD_UNIT_ID',
  'ADMOB_INTERSTITIAL_AD_UNIT_ID',
  'GA_MEASUREMENT_ID',
  'PAYPAL_CLIENT_ID',
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  'QURAN_API_URL',
  'QURAN_CHAPTERS_API_URL',
  'QURAN_AUDIO_BASE_URL',
  'QURAN_RECITER_ID',
  'QURAN_ARTWORK_URL'
];

const injectableExtensions = new Set(['.html', '.js', '.json', '.txt', '.xml']);

async function ensureParentDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

async function copyWebAssets(sourceDir, destDir) {
  for (const entry of await readdir(sourceDir)) {
    const sourcePath = join(sourceDir, entry);
    const relFromRoot = sourcePath.slice(rootDir.length + 1);
    const info = await stat(sourcePath);

    if (sourceDir === rootDir && excludedRoots.has(entry)) continue;
    if (excludedFiles.has(basename(sourcePath))) continue;

    if (info.isDirectory()) {
      await copyWebAssets(sourcePath, join(destDir, entry));
      continue;
    }

    const extension = extname(sourcePath);
    if (!webAssetExtensions.has(extension) && !basename(sourcePath).startsWith('.env')) {
      continue;
    }

    const targetPath = join(outDir, relFromRoot);
    await ensureParentDir(targetPath);
    await cp(sourcePath, targetPath, { force: true });
  }
}

async function injectPlaceholders(dir) {
  for (const entry of await readdir(dir)) {
    const filePath = join(dir, entry);
    const info = await stat(filePath);

    if (info.isDirectory()) {
      await injectPlaceholders(filePath);
      continue;
    }

    if (!injectableExtensions.has(extname(filePath))) continue;

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

async function stripWebAdsFromAndroid(dir) {
  if (!isAndroidBuild) return;

  for (const entry of await readdir(dir)) {
    const filePath = join(dir, entry);
    const info = await stat(filePath);
    if (info.isDirectory()) {
      await stripWebAdsFromAndroid(filePath);
      continue;
    }
    if (extname(filePath) !== '.html') continue;

    const contents = await readFile(filePath, 'utf8');
    const cleaned = contents
      .replace(/\s*<meta\s+name=["']google-adsense-account["'][^>]*>\s*/gi, '\n')
      .replace(/\s*<script\s+async\s+src=["'][^"']*pagead2\.googlesyndication\.com[^>]*><\/script>\s*/gi, '\n');
    if (cleaned !== contents) await writeFile(filePath, cleaned);
  }
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await copyWebAssets(rootDir, outDir);
await injectPlaceholders(outDir);
await stripWebAdsFromAndroid(outDir);

for (const file of requiredDistFiles) {
  try {
    await stat(join(outDir, file));
  } catch {
    throw new Error(`Build output is incomplete: dist/${file} is missing.`);
  }
}

console.log(`Web build completed: dist/ (${isAndroidBuild ? 'Android' : 'website'})`);
