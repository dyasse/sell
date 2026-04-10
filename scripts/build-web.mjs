import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');

const includeEntries = [
  'assets',
  'adhkar-details.html',
  'adhkar.html',
  'adhkar.js',
  'adhkar.json',
  'ads.txt',
  'auth.js',
  'details.html',
  'details.js',
  'duas.html',
  'duas.js',
  'favorites.html',
  'favorites.js',
  'firebase-config.js',
  'index.html',
  'manifest.json',
  'products.json',
  'quran.html',
  'quran.js',
  'robots.txt',
  'salat.html',
  'salat.js',
  'script.js',
  'sitemap.xml',
  'styles.css',
  'support.html',
  'support.js',
  'sw.js'
];

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });

for (const entry of includeEntries) {
  const src = join(root, entry);
  if (!existsSync(src)) {
    console.warn(`[build] Skipping missing entry: ${entry}`);
    continue;
  }

  const dest = join(distDir, entry);
  const srcStat = statSync(src);
  cpSync(src, dest, { recursive: srcStat.isDirectory() });
}

const distFiles = readdirSync(distDir);
console.log(`[build] Build complete. dist/ contains ${distFiles.length} top-level entries.`);
