const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const outDir = path.join(projectRoot, 'dist');

const topLevelAllowList = new Set([
  '.html',
  '.js',
  '.css',
  '.json',
  '.txt',
  '.xml',
  '.png',
  '.ico',
  '.webmanifest',
]);

const includeDirs = new Set(['assets']);
const includeFiles = new Set(['manifest.json', 'sw.js']);
const excludeNames = new Set([
  '.git',
  '.github',
  'node_modules',
  'android',
  'android-webview',
  'dist',
  'scripts',
]);

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function shouldCopyTopLevel(entry) {
  if (includeFiles.has(entry)) return true;
  const ext = path.extname(entry);
  return topLevelAllowList.has(ext);
}

cleanDir(outDir);

for (const entry of fs.readdirSync(projectRoot)) {
  if (excludeNames.has(entry)) continue;

  const sourcePath = path.join(projectRoot, entry);
  const stat = fs.statSync(sourcePath);

  if (stat.isDirectory()) {
    if (includeDirs.has(entry)) {
      copyRecursive(sourcePath, path.join(outDir, entry));
    }
    continue;
  }

  if (shouldCopyTopLevel(entry)) {
    copyRecursive(sourcePath, path.join(outDir, entry));
  }
}

console.log('Built web assets to dist/.');
