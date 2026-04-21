import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import GoogleAnalytics from '../components/GoogleAnalytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'موقع القرآن الكريم',
    template: '%s | موقع القرآن الكريم',
  },
  description: 'منصة لعرض القرآن الكريم والتفسير بمحتوى عربي منظم وقابل للأرشفة.',
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
      <body>{children}</body>
    </html>
  );
}
