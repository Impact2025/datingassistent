import type { Metadata } from 'next';

/**
 * Layout for 50-Plus Landing Page
 * Provides SEO metadata for the age-specific landing page
 */

export const metadata: Metadata = {
  title: 'Daten na 50 - Begin opnieuw met wijsheid | DatingAssistent',
  description:
    'Speciaal voor 50-plussers: vind een partner die bij je levensfase past. Privacy-first coaching met respect voor je tijd en ervaring. 35% van onze leden is 50-plusser - jij bent in goed gezelschap.',
  keywords: [
    'daten na 50',
    'dating 50 plus',
    'daten na scheiding',
    'opnieuw daten na 50',
    'dating coach 50 plus',
    'relatie na 50',
    'single na 50',
    'hoe daten na 20 jaar huwelijk',
    'ben ik te oud om te daten',
    'daten met kinderen',
    'privacy datingapps',
  ],
  openGraph: {
    title: 'Daten na 50? Jouw wijsheid is je superkracht',
    description:
      'Speciaal voor 50-plussers: begin opnieuw met vertrouwen. Privacy gegarandeerd, emotionele begeleiding, en tools die jouw levensfase begrijpen. Gemiddelde leeftijd leden: 42 jaar.',
    publishedTime: '2026-02-15T00:00:00.000Z',
    modifiedTime: '2026-02-15T00:00:00.000Z',
    type: 'website',
    url: 'https://datingassistent.nl/50-plus',
    images: [
      {
        url: '/images/50plus-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Daten na 50 - Begin Opnieuw Met Wijsheid',
      },
    ],
    locale: 'nl_NL',
    siteName: 'DatingAssistent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daten na 50? Jouw wijsheid is je superkracht',
    description:
      'Speciaal voor 50-plussers: privacy-first coaching voor een nieuwe start. Gemiddelde leeftijd: 42 jaar.',
    images: ['/images/50plus-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://datingassistent.nl/50-plus',
  },
  other: {
    'age-range': '50-65',
    'target-audience': '50+ singles, divorced, widowed, never married',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'DatingAssistent voor 50-plussers',
  description:
    'Dating coaching en begeleiding speciaal voor 50+ singles. Privacy-first approach met emotionele readiness scan.',
  datePublished: '2026-02-15',
  dateModified: '2026-02-15',
  provider: {
    '@type': 'Organization',
    name: 'DatingAssistent',
    url: 'https://datingassistent.nl',
    logo: 'https://datingassistent.nl/images/LogoDA.png',
  },
  audience: {
    '@type': 'PeopleAudience',
    suggestedMinAge: 50,
    suggestedMaxAge: 65,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Nederland',
  },
  availableLanguage: 'nl',
  serviceType: 'Dating Coaching',
  offers: [
    {
      '@type': 'Offer',
      name: 'Kickstart',
      price: '47',
      priceCurrency: 'EUR',
      description: '21-dagen discrete start voor 50-plussers',
    },
    {
      '@type': 'Offer',
      name: 'Transformatie',
      price: '147',
      priceCurrency: 'EUR',
      description: 'Complete opleiding - meest gekozen door 50-plussers',
    },
    {
      '@type': 'Offer',
      name: 'VIP Reis',
      price: '797',
      priceCurrency: 'EUR',
      description: '6 maanden persoonlijke coaching met maximale privacy',
    },
  ],
};

export default function FiftyPlusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
