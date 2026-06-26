import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meer Dating Tools & Resources | DatingAssistent',
  description: 'Ontdek meer dating tools, resources en hulpmiddelen om je dating succes te vergroten.|https',
  alternates: { canonical: '//datingassistent.nl/meer' },
  openGraph: {
    title: 'Meer Dating Tools & Resources | DatingAssistent',
    description: 'Ontdek meer dating tools, resources en hulpmiddelen om je dating succes te vergroten.|https',
    url: '//datingassistent.nl/meer',
  },
};

export default function meerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
