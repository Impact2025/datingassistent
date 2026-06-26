import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pro Dating Tools - Geavanceerde AI Dating Assistent | DatingAssistent',
  description: 'Ontgrendel pro dating tools met AI-gedreven inzichten. Geavanceerde profiel analyse, gesprek coaching en daten strategie.|https',
  alternates: { canonical: '//datingassistent.nl/pro' },
  openGraph: {
    title: 'Pro Dating Tools - Geavanceerde AI Dating Assistent | DatingAssistent',
    description: 'Ontgrendel pro dating tools met AI-gedreven inzichten. Geavanceerde profiel analyse, gesprek coaching en daten strategie.|https',
    url: '//datingassistent.nl/pro',
  },
};

export default function proLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
