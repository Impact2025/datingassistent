import { AiBioGenerator } from '@/components/tools/ai-bio-generator';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Dating Bio Generator | Gratis Profieltekst | DatingAssistent',
  description: 'Laat AI een overtuigende dating bio voor je schrijven. Persoonlijk, authentiek en afgestemd op jouw doelgroep. Gratis te gebruiken.',
  alternates: { canonical: 'https://www.datingassistent.nl/tools/ai-bio-generator' },
  openGraph: {
    title: 'AI Dating Bio Generator | Gratis Profieltekst | DatingAssistent',
    description: 'Laat AI een overtuigende dating bio voor je schrijven. Persoonlijk, authentiek en afgestemd op jouw doelgroep. Gratis te gebruiken.',
    url: 'https://www.datingassistent.nl/tools/ai-bio-generator',
  },
};

export default function AiBioGeneratorPage() {
  return <AiBioGenerator />;
}