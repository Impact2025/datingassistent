import type { Metadata } from 'next';
import { ScheidingHerstartLanding } from './scheiding-herstart-landing';

export const metadata: Metadata = {
  title: 'Opnieuw daten na een scheiding: wanneer ben je klaar (en hoe begin je)? | DatingAssistent',
  description: 'Doe de gratis scheiding herstart scan in 4 minuten. Ontdek jouw persoonlijk profiel, rebound risico check en een concreet actieplan — afgestemd op jouw situatie.',
  keywords: [
    'opnieuw daten na scheiding',
    'daten na scheiding',
    'wanneer klaar voor nieuwe relatie',
    'herstart na scheiding',
    'rebound risico',
    'scheiding verwerking',
    'nieuwe liefde na scheiding',
    'daten als gescheiden ouder',
  ],
  openGraph: {
    title: 'Opnieuw daten na een scheiding: wanneer ben je klaar?',
    description: 'Doe de gratis scan in 4 minuten. Persoonlijk profiel, rebound risico check en concreet actieplan — gratis en direct.',
    type: 'website',
    url: 'https://datingassistent.nl/scheiding-herstart',
    images: [
      {
        url: 'https://datingassistent.nl/images/dating-assistent-header.png',
        width: 1200,
        height: 630,
        alt: 'Opnieuw daten na een scheiding — DatingAssistent',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Opnieuw daten na een scheiding: wanneer ben je klaar?',
    description: 'Doe de gratis scan in 4 minuten. Persoonlijk profiel, rebound risico check en concreet actieplan.',
    images: ['https://datingassistent.nl/images/dating-assistent-header.png'],
  },
  alternates: {
    canonical: 'https://datingassistent.nl/scheiding-herstart',
  },
};

export default function ScheidingHerstartPage() {
  return <ScheidingHerstartLanding />;
}
