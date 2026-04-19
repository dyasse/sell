import TafsirContent from '../../../../components/TafsirContent';

interface TafsirPageProps {
  params: {
    surah: string;
    ayah: string;
  };
}

export default async function TafsirPage({ params }: TafsirPageProps) {
  const { surah, ayah } = params;

  const verseText = 'نص الآية هنا';
  const tafsirText = 'نص التفسير هنا';

  return (
    <main>
      <TafsirContent
        surahName={surah}
        ayahNumber={Number(ayah)}
        verseText={verseText}
        tafsirText={tafsirText}
        canonicalUrl={`https://example.com/tafsir/${surah}/${ayah}`}
      />
    </main>
  );
}
