import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podcasts - Dating & Relatie Podcasts | DatingAssistent',
  description: 'Luister naar onze podcasts over daten, relaties, zelfvertrouwen en emotionele groei. Gratis tips van dating experts.|https',
  alternates: { canonical: '//datingassistent.nl/podcasts' },
  openGraph: {
    title: 'Podcasts - Dating & Relatie Podcasts | DatingAssistent',
    description: 'Luister naar onze podcasts over daten, relaties, zelfvertrouwen en emotionele groei. Gratis tips van dating experts.|https',
    url: '//datingassistent.nl/podcasts',
  },
};

export default function podcastsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
