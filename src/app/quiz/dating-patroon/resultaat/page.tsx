'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PatternResult } from '@/components/quiz/pattern';
import type {
  AttachmentPattern,
  PatternQuizResultResponse,
} from '@/lib/quiz/pattern/pattern-types';

/**
 * Dating Patroon Quiz Result Page
 *
 * Displays quiz results fetched by ID from URL params.
 */

function ResultContent() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PatternQuizResultResponse | null>(null);

  useEffect(() => {
    if (!resultId) {
      setError('Geen resultaat ID gevonden');
      setIsLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/quiz/pattern/result/${resultId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Resultaat niet gevonden');
          }
          throw new Error('Er ging iets mis bij het ophalen van je resultaat');
        }

        const data: PatternQuizResultResponse = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Onbekende fout');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Je resultaat laden...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Oeps!</h1>
          <p className="text-gray-600">{error || 'Resultaat niet gevonden'}</p>
          <a
            href="/quiz/dating-patroon"
            className="inline-block px-6 py-3 bg-coral-500 text-white rounded-full font-medium hover:bg-coral-600 transition-colors"
          >
            Doe de quiz opnieuw
          </a>
        </div>
      </div>
    );
  }

  return (
    <PatternResult
      firstName={result.firstName}
      pattern={result.attachmentPattern as AttachmentPattern}
      anxietyScore={result.anxietyScore}
      avoidanceScore={result.avoidanceScore}
      confidence={result.confidence}
    />
  );
}

export default function DatingPatroonResultaatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Laden...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
