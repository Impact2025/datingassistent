import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ghosting Reframer | Omgaan met Ghosting | DatingAssistent',
  description: 'Leer omgaan met ghosting in dating. Onze reframer tool helpt je perspectief te krijgen en sterker verder te gaan na ghosting.',
  alternates: { canonical: 'https://datingassistent.nl/tools/ghosting-reframer' },
  openGraph: {
    title: 'Ghosting Reframer | Omgaan met Ghosting',
    description: 'Leer omgaan met ghosting en krijg perspectief met onze reframer tool.',
    url: 'https://datingassistent.nl/tools/ghosting-reframer',
  },
};

export default function ToolsGhostingReframerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
