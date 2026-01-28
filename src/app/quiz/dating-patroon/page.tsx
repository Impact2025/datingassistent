import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PatternQuiz } from '@/components/quiz/pattern';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';

/**
 * Dating Patroon Quiz Landing Page
 *
 * Main entry point for the Dating Pattern Quiz.
 * SEO-optimized for lead generation.
 */

export const metadata: Metadata = {
  title: 'Ontdek Je Dating Patroon | Gratis Quiz | DatingAssistent',
  description:
    'Waarom blijf je op dezelfde types vallen? Ontdek je Dating Patroon in 2 minuten met deze wetenschappelijk onderbouwde quiz gebaseerd op attachment theory. Krijg direct inzicht in je patronen en concrete tips.',
  keywords: [
    'dating patroon',
    'attachment style',
    'hechtingsstijl',
    'dating quiz',
    'relatie patroon',
    'dating problemen',
    'attachment theory',
    'ECR-R',
  ],
  openGraph: {
    title: 'Waarom Blijf Je Op Dezelfde Types Vallen?',
    description:
      'Ontdek je Dating Patroon in 2 minuten — en waarom het je saboteert. Gratis wetenschappelijk onderbouwde quiz.',
    type: 'website',
    images: [
      {
        url: '/images/quiz/dating-patroon-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Dating Patroon Quiz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ontdek Je Dating Patroon | Gratis Quiz',
    description:
      'Waarom blijf je op dezelfde types vallen? Ontdek het in 2 minuten.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://datingassistent.nl/quiz/dating-patroon',
  },
};

// JSON-LD structured data for rich results
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Dating Patroon Quiz',
  description:
    'Ontdek je Dating Patroon gebaseerd op attachment theory. Wetenschappelijk onderbouwde quiz met persoonlijke resultaten.',
  educationalLevel: 'beginner',
  about: {
    '@type': 'Thing',
    name: 'Attachment Style',
    description: 'Psychological attachment patterns in romantic relationships',
  },
  provider: {
    '@type': 'Organization',
    name: 'DatingAssistent',
    url: 'https://datingassistent.nl',
  },
};

export default function DatingPatroonQuizPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Quiz Component with Suspense for useSearchParams */}
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-coral-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Laden...</p>
            </div>
          </div>
        }
      >
        <PatternQuiz />
      </Suspense>

      {/* Cookie Consent Banner (required by law) */}
      <CookieConsentBanner />
    </>
  );
}
