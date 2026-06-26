import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Persoonlijke Groei in Dating | Ontwikkel Jezelf | DatingAssistent',
  description: 'Werk aan je persoonlijke groei in dating. Leer over zelfvertrouwen, emotionele intelligentie en aantrekkingskracht.|https',
  alternates: { canonical: '//datingassistent.nl/groei' },
  openGraph: {
    title: 'Persoonlijke Groei in Dating | Ontwikkel Jezelf | DatingAssistent',
    description: 'Werk aan je persoonlijke groei in dating. Leer over zelfvertrouwen, emotionele intelligentie en aantrekkingskracht.|https',
    url: '//datingassistent.nl/groei',
  },
};

export default function groeiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
