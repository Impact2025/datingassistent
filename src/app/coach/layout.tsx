import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Dating Coach | 24/7 Persoonlijke Coach | DatingAssistent',
  description: 'Ontmoet je AI dating coach. Krijg 24/7 persoonlijk advies over profielen, gesprekken, dates en relaties.|https',
  alternates: { canonical: '//datingassistent.nl/coach' },
  openGraph: {
    title: 'AI Dating Coach | 24/7 Persoonlijke Coach | DatingAssistent',
    description: 'Ontmoet je AI dating coach. Krijg 24/7 persoonlijk advies over profielen, gesprekken, dates en relaties.|https',
    url: '//datingassistent.nl/coach',
  },
};

export default function coachLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
