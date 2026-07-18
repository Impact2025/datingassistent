import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vibe Check Tool | Match Energie Check | DatingAssistent',
  description: 'Check de vibe met je match. Ontdek of jullie energie matchen en of er potentie is voor een echte connectie.',
  alternates: { canonical: 'https://www.datingassistent.nl/tools/vibe-check' },
  openGraph: {
    title: 'Vibe Check Tool | Match Energie Check',
    description: 'Check de vibe met je match. Ontdek energie en connectie potentie.',
    url: 'https://www.datingassistent.nl/tools/vibe-check',
  },
};

export default function ToolsVibeCheckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
