import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dating Tools - Gratis AI Tools voor Succesvol Daten | DatingAssistent',
  description: 'Ontdek onze gratis AI dating tools: 36 vragen voor intimiteit, AI bio generator, vibe check, ghosting reframer en energie batterij. Versterk je dating skills.',
  alternates: { canonical: 'https://datingassistent.nl/tools' },
  openGraph: {
    title: 'Dating Tools - Gratis AI Tools voor Succesvol Daten',
    description: 'Ontdek onze gratis AI dating tools voor betere gesprekken, profielen en inzichten.',
    url: 'https://datingassistent.nl/tools',
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
