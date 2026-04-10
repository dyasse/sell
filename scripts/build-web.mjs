import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const rootDir = process.cwd();
const outDir = join(rootDir, 'dist');

const excluded = new Set([
  '.git',
  '.github',
  '.idea',
  '.vscode',
  'android',
  'dist',
  'node_modules',
  'scripts',
  'package.json',
  'package-lock.json',
  'capacitor.config.json',
  'vercel.json',
  'README.md',
  'SECURITY.md'
]);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of await readdir(rootDir)) {
  if (excluded.has(entry)) continue;

  await cp(join(rootDir, entry), join(outDir, entry), {
    recursive: true,
    force: true
  });
}

console.log('Web build completed: dist/');
