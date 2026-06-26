import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Relationship Coach | DatingAssistent',
  description: 'Jouw 24/7 persoonlijke AI relatie coach. Krijg direct advies, inzichten en begeleiding bij elke stap van je dating journey — gebaseerd op jouw unieke situatie.',
  openGraph: {
    title: 'AI Relationship Coach | DatingAssistent',
    description: 'Krijg direct advies en inzichten van je persoonlijke AI relatie coach.',
    type: 'website',
    url: 'https://datingassistent.nl/ai-relationship-coach',
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Relationship Coach | DatingAssistent',
    description: '24/7 persoonlijke AI coaching voor dating en relaties.',
  },
  alternates: { canonical: 'https://datingassistent.nl/ai-relationship-coach' },
};

export default function AICoachLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
