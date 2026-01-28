'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, CheckCircle, Lock, Clock, BookOpen, Award } from 'lucide-react';
import type { CursusMetVoortgang } from '@/types/cursus.types';

interface CursusViewerProps {
  cursusSlug: string;
  onBack: () => void;
  onLessonSelect?: (lessonSlug: string) => void;
}

export function CursusViewer({ cursusSlug, onBack, onLessonSelect }: CursusViewerProps) {
  const [cursus, setCursus] = useState<CursusMetVoortgang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cursusSlug) {
      fetchCursusDetail();
    }
  }, [cursusSlug]);

  const fetchCursusDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cursussen/${cursusSlug}`);

      if (!response.ok) {
        throw new Error('Cursus niet gevonden');
      }

      const data = await response.json();
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
        return <CheckCircle className="w-5 h-5 text-coral-500" />;
      case 'bezig':
        return <Play className="w-5 h-5 text-coral-500" />;
      default:
        return <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
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

  const handleLesClick = (lesSlug: string) => {
    // Open les within dashboard if onLessonSelect is provided
    if (onLessonSelect) {
      onLessonSelect(lesSlug);
    } else {
      // Fallback: open in new tab
      window.open(`/cursussen/${cursusSlug}/${lesSlug}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <Card className="border-0 shadow-sm dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !cursus) {
    return (
      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Cursus niet gevonden</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'Deze cursus bestaat niet of is niet beschikbaar.'}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalLessons = cursus.lessen?.length || 0;
  const completedLessons = cursus.lessen?.filter(l => getLesStatus(l) === 'afgerond').length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardContent className="p-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar cursussen
          </Button>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cursus.titel}</h1>
                <Badge className="bg-coral-100 text-coral-800 border-0">
                  {cursus.cursus_type === 'gratis' ? 'Gratis' : `EUR ${cursus.prijs}`}
                </Badge>
              </div>
              {cursus.subtitel && (
                <p className="text-gray-600 dark:text-gray-300">{cursus.subtitel}</p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-coral-500" />
              <span>{cursus.duur_minuten} minuten</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-coral-500" />
              <span>{totalLessons} lessen</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-coral-500" />
              <span>{cursus.niveau}</span>
            </div>
          </div>

          {/* Progress */}
          {progressPercentage > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-200 font-medium">Je voortgang</span>
                <span className="text-coral-600 dark:text-coral-400 font-semibold">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {completedLessons} van {totalLessons} lessen voltooid
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {cursus.beschrijving && (
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Over deze cursus</h2>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{cursus.beschrijving}</p>
          </CardContent>
        </Card>
      )}

      {/* Lessons */}
      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lessen</h2>
          <div className="space-y-3">
            {cursus.lessen?.map((les: any, index: number) => {
              const status = getLesStatus(les);
              return (
                <div
                  key={les.id}
                  onClick={() => handleLesClick(les.slug)}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-coral-300 hover:bg-coral-50/30 dark:hover:bg-coral-900/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-coral-600 transition-colors">
                          Les {index + 1}: {les.titel}
                        </h3>
                        {les.subtitel && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{les.subtitel}</p>
                        )}
                        {les.duur_minuten && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {les.duur_minuten} min
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="ml-4"
                      variant={status === 'afgerond' ? 'outline' : 'default'}
                    >
                      {getStatusLabel(status)}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
