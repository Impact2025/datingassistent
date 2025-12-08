'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button-system';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, CheckCircle, Lock, Clock, BookOpen } from 'lucide-react';
import type { CursusMetVoortgang } from '@/types/cursus.types';
import { getCanonicalSlug } from '@/lib/cursus-slug-utils';

export default function CursusDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params.slug as string;

  // ✨ WERELDKLASSE: Redirect to canonical URL if using alias
  useEffect(() => {
    const { canonical, wasAlias } = getCanonicalSlug(rawSlug);
    if (wasAlias) {
      console.log(`🔄 Redirecting from alias ${rawSlug} to canonical ${canonical}`);
      router.replace(`/cursussen/${canonical}`);
    }
  }, [rawSlug, router]);

  const slug = rawSlug; // API will handle the alias resolution

  const [cursus, setCursus] = useState<CursusMetVoortgang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCursusDetail();
    }
  }, [slug, router]);

  const fetchCursusDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cursussen/${slug}`);

      if (!response.ok) {
        throw new Error('Cursus niet gevonden');
      }

      const data = await response.json();

      // Check if user has access
      if (data.cursus.hasAccess === false) {
        // Redirect to pricing page if no access
        router.push('/prijzen');
        return;
      }

      setCursus(data.cursus);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching cursus:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLesStatus = (les: any) => {
    if (!les.user_progress) return 'niet-gestart';
    return les.user_progress.status || 'niet-gestart';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'afgerond':
        return <CheckCircle className="w-5 h-5 text-pink-500" />;
      case 'bezig':
        return <Play className="w-5 h-5 text-pink-500" />;
      default:
        return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'afgerond':
        return 'Voltooid';
      case 'bezig':
        return 'Bezig';
      default:
        return 'Start les';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-white rounded shadow-sm"></div>
            <div className="h-32 bg-white rounded shadow-sm"></div>
            <div className="h-32 bg-white rounded shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cursus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md border-0 shadow-sm bg-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cursus niet gevonden</h2>
            <p className="text-gray-600 mb-6">{error || 'Deze cursus bestaat niet of is niet beschikbaar.'}</p>
            <Link href="/cursussen">
              <SecondaryButton>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar overzicht
              </SecondaryButton>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = cursus.user_progress;
  const totalLessons = cursus.lessen?.length || 0;
  const completedLessons = cursus.lessen?.filter(l => getLesStatus(l) === 'afgerond').length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/cursussen"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar cursussen
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">{cursus.titel}</h1>
                <Badge className={
                  cursus.cursus_type === 'gratis'
                    ? 'bg-pink-100 text-pink-800 border-0'
                    : 'bg-pink-100 text-pink-800 border-0'
                }>
                  {cursus.cursus_type === 'gratis' ? 'Gratis' : `EUR ${cursus.prijs}`}
                </Badge>
              </div>
              {cursus.subtitel && (
                <p className="text-base text-gray-600">{cursus.subtitel}</p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-500" />
              <span>{cursus.duur_minuten} minuten</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-500" />
              <span>{totalLessons} lessen</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{completedLessons}/{totalLessons} voltooid</span>
            </div>
          </div>

          {/* Progress Bar */}
          {progressPercentage > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Jouw voortgang</span>
                <span className="font-medium text-pink-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Beschrijving */}
        {cursus.beschrijving_lang && (
          <Card className="mb-6 border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Over deze cursus</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{cursus.beschrijving_lang}</p>
            </CardContent>
          </Card>
        )}

        {/* Leerdoelen */}
        {cursus.doelen && cursus.doelen.length > 0 && (
          <Card className="mb-6 border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Wat je leert</h2>
              <ul className="space-y-3">
                {cursus.doelen.map((doel, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">{doel}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Lessen */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lessen</h2>
          <div className="space-y-3">
            {cursus.lessen?.map((les, idx) => {
              const status = getLesStatus(les);
              const isCompleted = status === 'afgerond';
              const isInProgress = status === 'bezig';
              const canStart = idx === 0 || getLesStatus(cursus.lessen![idx - 1]) === 'afgerond';

              return (
                <Card
                  key={les.id}
                  className="border-0 shadow-sm bg-white transition-all hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-base font-semibold text-white shadow-sm">
                          {les.volgorde}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {les.titel}
                          </h3>
                          {les.beschrijving && (
                            <p className="text-gray-600 text-sm mb-2 leading-relaxed">{les.beschrijving}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {les.video_duur && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-pink-500" />
                                {les.video_duur}
                              </span>
                            )}
                            {les.duur_minuten && (
                              <span>{les.duur_minuten} min</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {getStatusIcon(status)}

                        <Link href={canStart ? `/cursussen/${slug}/${les.slug}` : '#'}>
                          <PrimaryButton
                            size="sm"
                            disabled={!canStart}
                            className={!canStart ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'}
                          >
                            {getStatusLabel(status)}
                          </PrimaryButton>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Gekoppelde Tools */}
        {cursus.gekoppelde_tools && cursus.gekoppelde_tools.length > 0 && (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Aanbevolen tools</h2>
              <p className="text-gray-600 mb-4">
                Gebruik deze tools om het maximale uit deze cursus te halen:
              </p>
              <div className="flex flex-wrap gap-2">
                {cursus.gekoppelde_tools.map((toolId, idx) => (
                  <Badge key={idx} className="bg-pink-100 text-pink-800 border-0">
                    {toolId.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
