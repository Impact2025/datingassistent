import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PatternQuiz } from '@/components/quiz/pattern';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';

/**
 * Emotionele Readiness Quiz voor 50-Plussers
 *
 * Speciaal aangepaste quiz voor 50+ singles om emotionele gereedheid te checken
 * Focus op: scheiding recovery, patronen, privacy concerns, en ouderschap
 */

export const metadata: Metadata = {
  title: 'Ben Je Klaar Om Te Daten? | Emotionele Ready Scan voor 50+ | DatingAssistent',
  description:
    'Speciaal voor 50-plussers: ontdek of je emotioneel klaar bent om opnieuw te daten na je scheiding, verlies of verandering. Wetenschappelijk onderbouwde scan in 5 minuten. Privacy gegarandeerd.',
  keywords: [
    'daten na 50',
    'dating 50 plus',
    'daten na scheiding',
    'emotioneel klaar om te daten',
    'ben ik klaar voor een nieuwe relatie',
    'dating na verlies',
    'daten met kinderen',
    'hoe daten na 20 jaar huwelijk',
  ],
  openGraph: {
    title: 'Ben Je Emotioneel Klaar Om Opnieuw Te Daten?',
    description:
      'Speciaal voor 50-plussers: ontdek of je klaar bent voor een nieuwe relatie. Gratis 5-minuten scan met persoonlijk advies.',
    type: 'website',
    images: [
      {
        url: '/images/quiz/50plus-readiness-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Emotionele Ready Scan voor 50-Plussers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ben Je Klaar Om Te Daten? | Scan voor 50-Plussers',
    description:
      'Ontdek of je emotioneel klaar bent voor een nieuwe relatie. Speciaal voor 50-plussers.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://datingassistent.nl/quiz/emotionele-readiness-50plus',
  },
};

// JSON-LD structured data for rich results
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Emotionele Ready Scan voor 50-Plussers',
  description:
    'Ontdek of je emotioneel klaar bent om opnieuw te daten na je scheiding, verlies of grote verandering. Wetenschappelijk onderbouwde scan speciaal voor 50-plussers.',
  educationalLevel: 'intermediate',
  audience: {
    '@type': 'PeopleAudience',
    suggestedMinAge: 50,
    suggestedMaxAge: 65,
  },
  about: {
    '@type': 'Thing',
    name: 'Dating Readiness',
    description: 'Emotional readiness for dating after divorce or loss for mature singles',
  },
  provider: {
    '@type': 'Organization',
    name: 'DatingAssistent',
    url: 'https://datingassistent.nl',
  },
};

export default function EmotioneleReadiness50PlusQuizPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/*
        Quiz Component with Suspense
        Using PatternQuiz as base - results will be tagged with segment=50plus
      */}
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-rose-50 via-cream to-purple-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Laden...</p>
            </div>
          </div>
        }
      >
        {/*
          Using existing PatternQuiz component
          TODO: Create custom 50+ quiz component with specific questions:
          - Scheiding recovery timeline
          - Ouderschap/co-parenting considerations
          - Privacy concerns assessment
          - Career stability questions
          - Emotional pattern recognition

          For now, PatternQuiz will work and results will be tagged with source=50plus
        */}
        <PatternQuiz />
      </Suspense>

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
    </>
  );
}
