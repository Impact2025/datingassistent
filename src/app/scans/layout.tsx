import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dating Scans & Assessments | Gratis Analyse | DatingAssistent',
  description: 'Doe gratis dating scans en assessments. Ontdek je dating stijl, hechtingsstijl, blinde vlekken en emotionele readiness.',
  alternates: { canonical: 'https://www.datingassistent.nl/scans' },
  openGraph: {
    title: 'Dating Scans & Assessments | Gratis Analyse',
    description: 'Doe gratis dating scans en assessments voor persoonlijke inzichten.',
    url: 'https://www.datingassistent.nl/scans',
  },
};

export default function ScansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
