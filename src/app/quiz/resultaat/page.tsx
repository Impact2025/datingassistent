'use client';

/**
 * Quiz Result Page - Wereldklasse Edition
 * Met cinematic reveal, radar chart en scarcity messaging
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ResultReveal } from '@/components/quiz/result-reveal';
import type { DatingStyle } from '@/lib/quiz/dating-styles';

function ResultContent() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');
  const [datingStyle, setDatingStyle] = useState<DatingStyle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId) {
      // Fetch result from API
      fetch(`/api/quiz/result/${resultId}`)
        .then(res => res.json())
        .then(data => {
          setDatingStyle(data.datingStyle);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching result:', err);
          setLoading(false);
        });
    }
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Je resultaten laden...</p>
        </div>
      </div>
    );
  }

  if (!datingStyle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900">Resultaat niet gevonden</h2>
            <p className="text-gray-600">Check je e-mail voor de link naar je resultaten.</p>
            <Link href="/quiz">
              <Button className="bg-gradient-to-r from-pink-500 to-pink-600">
                Doe de quiz opnieuw
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ResultReveal datingStyle={datingStyle} />
      </div>
    </div>
  );
}

export default function QuizResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
