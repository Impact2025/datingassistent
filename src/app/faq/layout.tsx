import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veelgestelde Vragen (FAQ) | DatingAssistent',
  description: 'Antwoorden op de meestgestelde vragen over DatingAssistent. Alles over hoe het werkt, prijzen, privacy en meer — snel antwoord op jouw datingvragen.',
  openGraph: {
    title: 'Veelgestelde Vragen (FAQ) | DatingAssistent',
    description: 'Alles over hoe DatingAssistent werkt, de prijzen, privacy en meer.',
    type: 'website',
    url: 'https://datingassistent.nl/faq',
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veelgestelde Vragen (FAQ) | DatingAssistent',
    description: 'Antwoorden op de meestgestelde vragen over DatingAssistent.',
  },
  alternates: { canonical: 'https://datingassistent.nl/faq' },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
