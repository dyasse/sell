import { existsSync } from 'node:fs';

const webDir = 'dist';

if (!existsSync(webDir)) {
  console.error(`[verify:webdir] Missing '${webDir}' directory. Run: npm run build`);
  process.exit(1);
}

console.log(`[verify:webdir] OK: '${webDir}' exists.`);
