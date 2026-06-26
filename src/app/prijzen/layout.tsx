import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prijzen & Abonnementen | DatingAssistent',
  description: 'Kies het abonnement dat bij jou past. Van gratis tools tot premium AI coaching en persoonlijke begeleiding. Transparante prijzen voor elke fase van je dating journey.',
  openGraph: {
    title: 'Prijzen & Abonnementen | DatingAssistent',
    description: 'Kies het abonnement dat bij jou past. Van gratis tools tot premium AI coaching.',
    type: 'website',
    url: 'https://datingassistent.nl/prijzen',
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prijzen & Abonnementen | DatingAssistent',
    description: 'Transparante prijzen voor elke fase van je dating journey.',
  },
  alternates: { canonical: 'https://datingassistent.nl/prijzen' },
};

export default function PrijzenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
