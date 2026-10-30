import type { Metadata } from 'next';
import { Cairo, Amiri } from 'next/font/google';
import './globals.css';
import FloatingHearts from '@/components/FloatingHearts';
import AudioPlayer from '@/components/AudioPlayer';
import BackToTop from '@/components/BackToTop';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'مفاجأة عيد ميلاد حبيبتي وست البنات ❤️🎂',
  description: 'موقع رومانسي خاص بمناسبة عيد ميلاد أجمل إنسانة في حياتي، يحكي قصة حبنا وذكرياتنا معاً.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❤️</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`}>
      <body className="min-h-screen relative flex flex-col font-cairo antialiased selection:bg-rose-200 selection:text-rose-900">
        {/* Floating gentle background hearts */}
        <FloatingHearts />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-20">
          {children}
        </div>

        {/* Floating Romantic Audio Player */}
        <AudioPlayer />

        {/* Back to top button */}
        <BackToTop />
      </body>
    </html>
  );
}

