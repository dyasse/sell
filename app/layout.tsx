import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';

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
      <body>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-8K72MGRLFG" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8K72MGRLFG');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
