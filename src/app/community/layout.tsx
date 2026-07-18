import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community | DatingAssistent',
  description: 'De DatingAssistent community. Leer van anderen, deel ervaringen en groei samen in je dating reis.',
  alternates: { canonical: 'https://www.datingassistent.nl/community' },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
