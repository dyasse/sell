import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'نبذة عن موقع القرآن الكريم.',
};

export default function AboutPage() {
  return (
    <main dir="rtl" lang="ar">
      <h1>من نحن</h1>
      <p>
        نحن منصة قرآنية تهدف إلى تقديم نصوص القرآن الكريم والتفسير بشكل واضح وسهل
        الوصول، مع التركيز على الفائدة التعليمية وجودة المحتوى.
      </p>
    </main>
  );
}
