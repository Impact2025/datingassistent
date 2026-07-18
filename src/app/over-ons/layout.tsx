import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over Ons | DatingAssistent',
  description: 'Het verhaal achter DatingAssistent — van datingcoach naar AI-architect. 10+ jaar praktijkervaring en innovatie in één platform voor betere matches.',
  openGraph: {
    title: 'Over Ons | DatingAssistent',
    description: 'Het verhaal achter DatingAssistent — van datingcoach naar AI-architect.',
    type: 'website',
    url: 'https://www.datingassistent.nl/over-ons',
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Over Ons | DatingAssistent',
    description: 'Het verhaal achter DatingAssistent — van datingcoach naar AI-architect.',
  },
  alternates: { canonical: 'https://www.datingassistent.nl/over-ons' },
};

export default function OverOnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
