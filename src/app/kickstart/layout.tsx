import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dating Kickstart - Start met Succesvol Daten | DatingAssistent',
  description: 'Begin met de DatingAssistent kickstart. Een gratis programma om je dating leven een vliegende start te geven.|https',
  alternates: { canonical: '//datingassistent.nl/kickstart' },
  openGraph: {
    title: 'Dating Kickstart - Start met Succesvol Daten | DatingAssistent',
    description: 'Begin met de DatingAssistent kickstart. Een gratis programma om je dating leven een vliegende start te geven.|https',
    url: '//datingassistent.nl/kickstart',
  },
};

export default function kickstartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
