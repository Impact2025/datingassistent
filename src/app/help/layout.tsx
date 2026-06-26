import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Ondersteuning | DatingAssistent',
  description: 'Veelgestelde vragen, handleidingen en ondersteuning voor DatingAssistent. Vind antwoorden op al je vragen.|https',
  alternates: { canonical: '//datingassistent.nl/help' },
  openGraph: {
    title: 'Help & Ondersteuning | DatingAssistent',
    description: 'Veelgestelde vragen, handleidingen en ondersteuning voor DatingAssistent. Vind antwoorden op al je vragen.|https',
    url: '//datingassistent.nl/help',
  },
};

export default function helpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
