import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dating Quiz Resultaat | Jouw Persoonlijke Inzichten | DatingAssistent',
  description: 'Bekijk jouw dating quiz resultaat. Ontdek persoonlijke inzichten, sterke punten en groeikansen voor succesvoller daten.',
  alternates: { canonical: 'https://www.datingassistent.nl/quiz/resultaat' },
  openGraph: {
    title: 'Dating Quiz Resultaat | Jouw Persoonlijke Inzichten',
    description: 'Bekijk jouw dating quiz resultaat met persoonlijke inzichten.',
    url: 'https://www.datingassistent.nl/quiz/resultaat',
  },
};

export default function QuizResultaatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
