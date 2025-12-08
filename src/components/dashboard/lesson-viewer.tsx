'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, Play } from 'lucide-react';
import { ComparisonSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/ComparisonSectie';
import { InsightSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/InsightSectie';
import { ExamplesSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/ExamplesSectie';
import { InteractiveSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/InteractiveSectie';
import { TekstSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/TekstSectie';
import { KernpuntenSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/KernpuntenSectie';
import { OpdrachtSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/OpdrachtSectie';
import { ReflectieSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/ReflectieSectie';
import { VideoSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/VideoSectie';
import { QuizSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/QuizSectie';
import { ToolSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/ToolSectie';
import { ActieplanSectie } from '@/app/cursussen/[slug]/[lesSlug]/components/ActieplanSectie';
import { useUser } from '@/providers/user-provider';

interface LessonViewerProps {
  cursusSlug: string;
  lessonSlug: string;
  onBack: () => void;
}

interface LesData {
  id: number;
  cursus_id: number;
  slug: string;
  titel: string;
  beschrijving?: string;
  volgorde: number;
  secties: any[];
  user_progress: {
    status: string;
    voltooide_secties: number[];
    laatste_sectie_id: number | null;
    quiz_scores: Record<number, number>;
  };
  navigatie: {
    vorige: { id: number; slug: string; titel: string } | null;
    volgende: { id: number; slug: string; titel: string } | null;
  };
  cursus: {
    id: number;
    slug: string;
    titel: string;
  };
}

export function LessonViewer({ cursusSlug, lessonSlug, onBack }: LessonViewerProps) {
  const { user } = useUser();
  const [les, setLes] = useState<LesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [huidigeSecties, setHuidigeSecties] = useState(0);

  useEffect(() => {
    if (cursusSlug && lessonSlug) {
      fetchLes();
    }
  }, [cursusSlug, lessonSlug]);

  const fetchLes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cursussen/${cursusSlug}/${lessonSlug}`);

      if (!response.ok) {
        throw new Error('Les niet gevonden');
      }

      const data = await response.json();
      console.log('🔍 LessonViewer: Fetched lesson data:', data);
      console.log('🔍 LessonViewer: Secties:', data.les?.secties);
      data.les?.secties?.forEach((s: any, i: number) => {
        console.log(`📝 Section ${i + 1}:`, {
          type: s.sectie_type,
          titel: s.titel,
          hasInhoud: !!s.inhoud,
          inhoud: s.inhoud
        });
      });
      setLes(data.les);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching les:', err);
    } finally {
      setLoading(false);
    }
  };

  const markeerSectieAlsVoltooid = async (sectieId: number) => {
    if (!user?.id || !les) return;

    try {
      await fetch(`/api/cursussen/${cursusSlug}/${lessonSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_sectie',
          userId: user.id,
          sectieId
        })
      });

      // Update local state
      setLes(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          user_progress: {
            ...prev.user_progress,
            voltooide_secties: [...prev.user_progress.voltooide_secties, sectieId]
          }
        };
      });

      setHuidigeSecties(prev => prev + 1);
    } catch (error) {
      console.error('Error marking section as complete:', error);
    }
  };

  const markeerLesAlsVoltooid = async () => {
    if (!user?.id || !les) return;

    try {
      await fetch(`/api/cursussen/${cursusSlug}/${lessonSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_les',
          userId: user.id
        })
      });

      // Update local state
      setLes(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          user_progress: {
            ...prev.user_progress,
            status: 'afgerond'
          }
        };
      });
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  const isSectieVoltooid = (sectieId: number) => {
    return les?.user_progress.voltooide_secties.includes(sectieId) || false;
  };

  const renderSectie = (sectie: any, index: number) => {
    const isCompleted = isSectieVoltooid(sectie.id);

    switch (sectie.sectie_type) {
      case 'comparison':
        return (
          <ComparisonSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'insight':
        return (
          <InsightSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'examples':
        return (
          <ExamplesSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'interactive':
        return (
          <InteractiveSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'tekst':
        return (
          <TekstSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'kernpunten':
        return (
          <KernpuntenSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'opdracht':
        return (
          <OpdrachtSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'reflectie':
        return (
          <ReflectieSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'video':
        return (
          <VideoSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'quiz':
        return (
          <QuizSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'tool':
        return (
          <ToolSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      case 'actieplan':
        return (
          <ActieplanSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markeerSectieAlsVoltooid(sectie.id)}
          />
        );

      default:
        return (
          <Card key={sectie.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{sectie.titel}</h3>
                {isCompleted && <CheckCircle className="w-6 h-6 text-pink-500" />}
              </div>
              <p className="text-gray-500 mb-4">Onbekend sectie type: {sectie.sectie_type}</p>
              {!isCompleted && (
                <Button
                  onClick={() => markeerSectieAlsVoltooid(sectie.id)}
                  variant="outline"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Markeer als voltooid
                </Button>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !les) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Les niet gevonden</h2>
          <p className="text-gray-600 mb-6">{error || 'Deze les bestaat niet of is niet beschikbaar.'}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar cursus
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalSecties = les.secties?.length || 0;
  const voltooideSecties = les.user_progress.voltooide_secties.length;
  const progress = totalSecties > 0 ? (voltooideSecties / totalSecties) * 100 : 0;
  const isLesVoltooid = les.user_progress.status === 'afgerond';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <Button onClick={onBack} variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar {les.cursus.titel}
          </Button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{les.titel}</h1>
            {les.beschrijving && (
              <p className="text-gray-600 text-lg">{les.beschrijving}</p>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {voltooideSecties} van {totalSecties} secties voltooid
              </span>
              <span className="font-medium text-pink-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Secties */}
      <div className="space-y-6">
        {les.secties?.map((sectie, index) => renderSectie(sectie, index))}
      </div>

      {/* Complete Lesson Button */}
      {!isLesVoltooid && voltooideSecties === totalSecties && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-pink-50 to-pink-100">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Les voltooid!</h3>
            <p className="text-gray-600 mb-4">
              Je hebt alle secties doorlopen. Markeer de les als voltooid om door te gaan.
            </p>
            <Button
              onClick={markeerLesAlsVoltooid}
              className="bg-gradient-to-r from-pink-500 to-pink-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Les voltooien
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {les.navigatie.vorige ? (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {les.navigatie.vorige.titel}
              </Button>
            ) : (
              <div />
            )}

            {les.navigatie.volgende ? (
              <Button onClick={onBack} className="ml-auto">
                {les.navigatie.volgende.titel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={onBack} variant="outline" className="ml-auto">
                Terug naar cursus
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
