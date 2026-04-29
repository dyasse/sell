import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتصل بنا | نور القرآن',
  description:
    'تواصل مع فريق نور القرآن للاستفسارات، الملاحظات، التعاون، أو التبليغ عن أي مشكلة تقنية أو محتوى يحتاج مراجعة.',
  keywords: [
    'اتصل بنا',
    'تواصل',
    'دعم موقع القرآن',
    'مراسلة فريق نور',
    'اقتراحات الموقع',
  ],
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <main dir="rtl" lang="ar" style={{ padding: '20px', lineHeight: 1.9 }}>
      <h1>اتصل بنا</h1>
      <p>
        إذا كانت لديك ملاحظات لتحسين تجربة المستخدم، أو اقتراحات بخصوص صفحات القرآن
        الكريم والتفسير والأذكار، يسعدنا تواصلك معنا.
      </p>

      <section>
        <h2>بيانات التواصل</h2>
        <p>
          <strong>الاسم:</strong> dyasse
          <br />
          <strong>البريد الإلكتروني:</strong>{' '}
          <a href="mailto:dyasse@gmail.com">dyasse@gmail.com</a>
        </p>
      </section>

      <section>
        <h2>متى نرد؟</h2>
        <p>
          نحاول الرد في أقرب وقت ممكن على رسائل الدعم والاستفسارات، خاصة الرسائل المتعلقة
          بجودة المحتوى أو الأعطال التقنية.
        </p>
      </section>
    </main>
  );
}
