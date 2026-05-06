import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const ignoredDirs = new Set(['.git', 'android', 'dist', 'node_modules']);
const checkedExtensions = new Set(['.js', '.mjs']);
const files = [];

function extname(filePath) {
  const index = filePath.lastIndexOf('.');
  return index === -1 ? '' : filePath.slice(index);
}

async function collect(dir) {
  for (const entry of await readdir(dir)) {
    if (ignoredDirs.has(entry)) continue;

    const path = join(dir, entry);
    const info = await stat(path);

    if (info.isDirectory()) {
      await collect(path);
      continue;
    }

    if (checkedExtensions.has(extname(entry))) {
      files.push(path);
    }
  }
}

await collect(rootDir);

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log(`Syntax lint passed for ${files.length} JavaScript files.`);
