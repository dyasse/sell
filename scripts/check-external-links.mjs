import { sources } from '../content/library-data.mjs';

const timeoutMs = 15_000;
const uniqueUrls = [...new Set(Object.values(sources).map((source) => source.url))];
const results = [];

for (const url of uniqueUrls) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Nour-Quran-Editorial-Link-Audit/1.0' }
    });

    if ([403, 405, 429].includes(response.status)) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'Nour-Quran-Editorial-Link-Audit/1.0',
          range: 'bytes=0-1024'
        }
      });
    }

    const botProtected = [403, 429].includes(response.status);
    const healthy = (response.status >= 200 && response.status < 400) || botProtected;
    results.push({
      url,
      status: response.status,
      finalUrl: response.url,
      healthy,
      note: botProtected ? 'reachable in browser; automated audit is restricted' : ''
    });
  } catch (error) {
    results.push({ url, status: null, healthy: false, error: error.name === 'AbortError' ? 'timeout' : error.message });
  } finally {
    clearTimeout(timeout);
  }
}

console.table(results);

const broken = results.filter((result) => !result.healthy);
if (broken.length) {
  console.error(`External link audit found ${broken.length} unreachable source URL(s).`);
  process.exitCode = 1;
} else {
  console.log(`External link audit passed for ${results.length} unique source URLs.`);
}
