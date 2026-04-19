import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتصل بنا',
  description: 'طرق التواصل مع فريق موقع القرآن الكريم.',
};

export default function ContactPage() {
  return (
    <main dir="rtl" lang="ar">
      <h1>اتصل بنا</h1>
      <p>للتواصل معنا بخصوص المحتوى أو الإعلانات، يرجى مراسلتنا عبر البريد الإلكتروني:</p>
      <p>
        <a href="mailto:contact@example.com">contact@example.com</a>
      </p>
    </main>
  );
}
