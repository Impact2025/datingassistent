import type { Metadata } from 'next';

/**
 * Layout for 30-Plus Landing Page
 * Provides SEO metadata for the age-specific landing page
 */

export const metadata: Metadata = {
  title: 'Daten in je 30s - Stop met swipen, begin met verbinden | DatingAssistent',
  description:
    'Speciaal voor 30-plussers: ontdek hoe je bewust en intentioneel kunt daten. Privacy-first coaching, emotionele readiness check en begeleiding bij het vinden van een echte match. Gemiddelde leeftijd: 34 jaar.',
  keywords: [
    'daten in je 30',
    'dating 30 plus',
    'serieus daten 30',
    'daten na lange relatie',
    'dating coach 30 plus',
    'relatie vinden na 30',
    'single na 30',
    'bewust daten',
    'intentioneel daten',
    'datingapps 30 jaar',
    'serieuze relatie vinden',
  ],
  openGraph: {
    title: 'Daten in je 30s? Stop met swipen, begin met verbinden | DatingAssistent',
    description:
      'Speciaal voor 30-plussers: date bewust en intentioneel. Privacy gegarandeerd, emotionele begeleiding, en tools die begrijpen wat jij écht zoekt. Gemiddelde leeftijd leden: 34 jaar.',
    publishedTime: '2026-03-20T00:00:00.000Z',
    modifiedTime: '2026-03-20T00:00:00.000Z',
    type: 'website',
    url: 'https://www.datingassistent.nl/30-plus',
    images: [
      {
        url: '/images/30plus-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Daten in je 30s - Stop met swipen, begin met verbinden',
      },
    ],
    locale: 'nl_NL',
    siteName: 'DatingAssistent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daten in je 30s? Stop met swipen, begin met verbinden | DatingAssistent',
    description:
      'Speciaal voor 30-plussers: privacy-first coaching voor bewust daten. Gemiddelde leeftijd: 34 jaar.',
    images: ['/images/30plus-hero.jpg'],
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
    canonical: 'https://www.datingassistent.nl/30-plus',
  },
  other: {
    'age-range': '30-39',
    'target-audience': '30+ singles, career-focused, post-relationship, seeking serious connection',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'DatingAssistent voor 30-plussers',
  description:
    'Dating coaching en begeleiding speciaal voor 30+ singles. Privacy-first approach met emotionele readiness scan voor bewust en intentioneel daten.',
  datePublished: '2026-03-20',
  dateModified: '2026-03-20',
  provider: {
    '@type': 'Organization',
    name: 'DatingAssistent',
    url: 'https://www.datingassistent.nl',
    logo: 'https://www.datingassistent.nl/images/LogoDA.png',
  },
  audience: {
    '@type': 'PeopleAudience',
    suggestedMinAge: 30,
    suggestedMaxAge: 39,
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
      description: '21-dagen bewuste start voor 30-plussers',
    },
    {
      '@type': 'Offer',
      name: 'Transformatie',
      price: '147',
      priceCurrency: 'EUR',
      description: 'Complete opleiding - meest gekozen door 30-plussers',
    },
    {
      '@type': 'Offer',
      name: 'VIP Reis',
      price: '797',
      priceCurrency: 'EUR',
      description: '6 maanden persoonlijke coaching voor maximale resultaten',
    },
  ],
};

export default function ThirtyPlusLayout({
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
