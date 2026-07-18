import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energie Batterij | Dating Energie Check | DatingAssistent',
  description: 'Check je dating energie niveau. Ontdek of je emotioneel klaar bent om te daten en krijg tips om je batterij op te laden.',
  alternates: { canonical: 'https://www.datingassistent.nl/tools/energie-batterij' },
  openGraph: {
    title: 'Energie Batterij | Dating Energie Check',
    description: 'Check je dating energie niveau en krijg tips om op te laden.',
    url: 'https://www.datingassistent.nl/tools/energie-batterij',
  },
};

export default function ToolsEnergieBatterijLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
