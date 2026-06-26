import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Module 2: Profiel Optimalisatie - Van Onzichtbaar naar Onweerstaanbaar | DatingAssistent',
  description: 'Transformeer je datingprofiel van onzichtbaar naar onweerstaanbaar met bewezen technieken. Module 2 van onze gratis dating cursus.',
  alternates: { canonical: 'https://datingassistent.nl/cursus/profiel-optimalisatie' },
  openGraph: {
    title: 'Module 2: Profiel van Onzichtbaar naar Onweerstaanbaar',
    description: 'Transformeer je datingprofiel met bewezen technieken.',
    url: 'https://datingassistent.nl/cursus/profiel-optimalisatie',
  },
};

export default function CursusProfielLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
