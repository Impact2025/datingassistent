import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Dating Cursussen | DatingAssistent',
  description: 'Ontwikkel je dating vaardigheden met professionele cursussen. Van profiel optimalisatie tot communicatie — leer daten met bewezen strategieën en AI-begeleiding.',
  openGraph: {
    title: 'Online Dating Cursussen | DatingAssistent',
    description: 'Ontwikkel je dating vaardigheden met professionele cursussen en AI-begeleiding.',
    type: 'website',
    url: 'https://datingassistent.nl/cursussen',
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Dating Cursussen | DatingAssistent',
    description: 'Professionele cursussen voor betere dates en relaties.',
  },
  alternates: { canonical: 'https://datingassistent.nl/cursussen' },
};

export default function CursussenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
