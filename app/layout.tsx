import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import GoogleAnalytics from '../components/GoogleAnalytics';
import Header from '../components/Header';

export const metadata: Metadata = {
  metadataBase: new URL('https://nour-quran.com'),
  title: {
    default: 'موقع القرآن الكريم',
    template: '%s | موقع القرآن الكريم',
  },
  description: 'نور: القرآن الكريم كاملًا مع التفسير والأذكار والأدعية ومواقيت الصلاة بتجربة عربية سريعة ومتوافقة مع الجوال.',
  keywords: [
    'القرآن الكريم',
    'تفسير القرآن',
    'الأذكار',
    'الأدعية',
    'مواقيت الصلاة',
    'نور',
    'Quran',
    'Azkar',
    'Islamic app',
  ],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
