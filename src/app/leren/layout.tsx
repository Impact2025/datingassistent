import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leren over Daten - Kennis & Inzichten | DatingAssistent',
  description: 'Verdiep je kennis over daten, relaties en verbinding. Van psychologie tot praktische tips - blijf leren en groeien.|https',
  alternates: { canonical: '//datingassistent.nl/leren' },
  openGraph: {
    title: 'Leren over Daten - Kennis & Inzichten | DatingAssistent',
    description: 'Verdiep je kennis over daten, relaties en verbinding. Van psychologie tot praktische tips - blijf leren en groeien.|https',
    url: '//datingassistent.nl/leren',
  },
};

export default function lerenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
