import type { Metadata } from 'next';

/**
 * Layout for 40-Plus Landing Page
 * Provides SEO metadata for the age-specific landing page
 */

export const metadata: Metadata = {
  title: 'Daten na 40 - Begin Opnieuw Met Wijsheid | DatingAssistent',
  description:
    'Speciaal voor 40-plussers: ontdek hoe je levenservaring je sterkste troef is bij het daten. Privacy-first coaching, emotionele readiness check en begeleiding bij een nieuwe start. Gemiddelde leeftijd: 42 jaar.',
  keywords: [
    'daten na 40',
    'dating 40 plus',
    'daten na scheiding',
    'opnieuw daten na 40',
    'dating coach 40 plus',
    'relatie na 40',
    'single na 40',
    'hoe daten na 20 jaar huwelijk',
    'ben ik te oud om te daten',
    'daten met kinderen',
    'privacy datingapps',
  ],
  openGraph: {
    title: 'Daten na 40? Jouw Wijsheid is Je Superkracht',
    description:
      'Speciaal voor 40-plussers: begin opnieuw met vertrouwen. Privacy gegarandeerd, emotionele begeleiding, en tools die jouw levensfase begrijpen. Gemiddelde leeftijd leden: 42 jaar.',
    type: 'website',
    url: 'https://datingassistent.nl/40-plus',
    images: [
      {
        url: '/images/40plus-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Daten na 40 - Begin Opnieuw Met Wijsheid',
      },
    ],
    locale: 'nl_NL',
    siteName: 'DatingAssistent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daten na 40? Jouw Wijsheid is Je Superkracht',
    description:
      'Speciaal voor 40-plussers: privacy-first coaching voor een nieuwe start. Gemiddelde leeftijd: 42 jaar.',
    images: ['/images/40plus-hero.jpg'],
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
    canonical: 'https://datingassistent.nl/40-plus',
  },
  other: {
    'age-range': '40-65',
    'target-audience': '40+ singles, divorced, widowed, never married',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'DatingAssistent voor 40-Plussers',
  description:
    'Dating coaching en begeleiding speciaal voor 40+ singles. Privacy-first approach met emotionele readiness scan.',
  provider: {
    '@type': 'Organization',
    name: 'DatingAssistent',
    url: 'https://datingassistent.nl',
    logo: 'https://datingassistent.nl/images/LogoDA.png',
  },
  audience: {
    '@type': 'PeopleAudience',
    suggestedMinAge: 40,
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
      description: '21-dagen discrete start voor 40-plussers',
    },
    {
      '@type': 'Offer',
      name: 'Transformatie',
      price: '147',
      priceCurrency: 'EUR',
      description: 'Complete opleiding - meest gekozen door 40-plussers',
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

export default function FortyPlusLayout({
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
