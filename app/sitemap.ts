import type { MetadataRoute } from 'next';

const baseUrl = 'https://example.com';

const mainPages = ['', '/about', '/contact', '/terms', '/privacy-policy'];

const surahSlugs = Array.from({ length: 114 }, (_, i) => `/${i + 1}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = mainPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const surahEntries = surahSlugs.map((slug) => ({
    url: `${baseUrl}/surah${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticEntries, ...surahEntries];
}
