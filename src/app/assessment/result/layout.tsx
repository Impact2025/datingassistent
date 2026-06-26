import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessment Resultaat | Jouw Dating Inzichten | DatingAssistent',
  description: 'Bekijk de resultaten van jouw dating assessment. Ontdek persoonlijke inzichten en aanbevelingen voor jouw dating reis.',
  alternates: { canonical: 'https://datingassistent.nl/assessment/result' },
  openGraph: {
    title: 'Assessment Resultaat | Jouw Dating Inzichten',
    description: 'Bekijk jouw assessment resultaten met persoonlijke inzichten.',
    url: 'https://datingassistent.nl/assessment/result',
  },
};

export default function AssessmentResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
