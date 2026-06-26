import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dating Style Test | Ontdek Je Dating Profiel',
  description: 'Doe de dating style test en ontdek welk type dater je bent. Krijg inzichten over je dating gedrag.',
  alternates: { canonical: 'https://datingassistent.nl/dating-style' },
  openGraph: {
    title: 'Dating Style Test | Ontdek Je Dating Profiel',
    description: 'Doe de dating style test en ontdek welk type dater je bent. Krijg inzichten over je dating gedrag.',
    url: 'https://datingassistent.nl/dating-style',
  },
};

export default function DatingStyleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
