import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتفاقية الاستخدام',
  description: 'اتفاقية الاستخدام الخاصة بموقع القرآن الكريم.',
};

export default function TermsPage() {
  return (
    <main dir="rtl" lang="ar">
      <h1>اتفاقية الاستخدام</h1>
      <p>
        باستخدامك لهذا الموقع فإنك توافق على استخدامه للأغراض المشروعة فقط والالتزام
        بجميع الأنظمة المعمول بها.
      </p>
      <p>
        يُمنع إساءة استخدام المحتوى أو محاولة تعطيل الموقع أو التأثير على تجربة المستخدم
        للآخرين.
      </p>
    </main>
  );
}
