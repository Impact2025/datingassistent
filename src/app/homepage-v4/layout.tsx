import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DatingAssistent - AI Dating Coach voor Moderne Singles',
  description: 'Jouw persoonlijke AI dating coach voor profiel optimalisatie, gesprekstraining en date planning. Ontdek de beste versie van jezelf.|https',
  alternates: { canonical: '//datingassistent.nl' },
  openGraph: {
    title: 'DatingAssistent - AI Dating Coach voor Moderne Singles',
    description: 'Jouw persoonlijke AI dating coach voor profiel optimalisatie, gesprekstraining en date planning. Ontdek de beste versie van jezelf.|https',
    url: '//datingassistent.nl',
  },
};

export default function homepagev4Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
