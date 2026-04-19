interface TafsirContentProps {
  surahName: string;
  ayahNumber: number;
  verseText: string;
  tafsirText: string;
  canonicalUrl: string;
}

export default function TafsirContent({
  surahName,
  ayahNumber,
  verseText,
  tafsirText,
  canonicalUrl,
}: TafsirContentProps) {
  const headline = `تفسير ${surahName} - الآية ${ayahNumber}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    inLanguage: 'ar',
    headline,
    articleSection: 'تفسير القرآن',
    about: `سورة ${surahName} الآية ${ayahNumber}`,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    description: tafsirText.slice(0, 160),
  };

  return (
    <article dir="rtl" lang="ar">
      <header>
        <h1>تفسير الآية</h1>
      </header>

      <section aria-labelledby="verse-heading">
        <h2 id="verse-heading">{`الآية ${ayahNumber} من سورة ${surahName}`}</h2>
        <p>{verseText}</p>
      </section>

      <section aria-labelledby="tafsir-heading">
        <h2 id="tafsir-heading">التفسير</h2>
        <p>{tafsirText}</p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
