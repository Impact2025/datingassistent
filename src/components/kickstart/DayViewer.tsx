'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Play,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Clock,
  Lock,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type {
  ProgramDay,
  DayProgress,
  QuizAnswer,
  WerkboekAnswer,
  UpdateDayProgressInput,
} from '@/types/kickstart.types';
import { trackLessonStart, trackLessonComplete, trackVideoStart, trackVideoComplete } from '@/lib/analytics/ga4-events';

interface DayViewerProps {
  day: ProgramDay;
  progress: DayProgress | null;
  hasAccess: boolean;
  navigation: {
    previous: { dag_nummer: number; titel: string } | null;
    next: { dag_nummer: number; titel: string } | null;
  };
  onNavigate: (dayNumber: number) => void;
  onProgressUpdate: (data: UpdateDayProgressInput) => Promise<void>;
}

export function DayViewer({
  day,
  progress,
  hasAccess,
  navigation,
  onNavigate,
  onProgressUpdate,
}: DayViewerProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'quiz' | 'reflectie' | 'werkboek'>('video');
  const [isVideoComplete, setIsVideoComplete] = useState(progress?.video_completed || false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>(progress?.quiz_answers || []);
  const [quizSubmitted, setQuizSubmitted] = useState(progress?.quiz_completed || false);
  const [reflectieAnswer, setReflectieAnswer] = useState(progress?.reflectie_antwoord || '');
  // LAAG 3: Individual reflection answers per question type for Iris context
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [savingReflection, setSavingReflection] = useState<string | null>(null);
  const [werkboekAnswers, setWerkboekAnswers] = useState<WerkboekAnswer[]>(
    progress?.werkboek_antwoorden ||
      day.werkboek?.stappen.map((stap) => ({ stap, antwoord: '', completed: false })) ||
      []
  );
  const [saving, setSaving] = useState(false);

  // GA4: Track lesson start when component mounts
  useEffect(() => {
    if (hasAccess && day) {
      trackLessonStart({
        lesson_id: `kickstart-day-${day.dag_nummer}`,
        lesson_name: day.titel,
        course_name: 'Kickstart 21-Dagen',
        module_name: `Week ${Math.ceil(day.dag_nummer / 7)}`,
      });
    }
  }, [day?.dag_nummer, hasAccess]);

  // Calculate completion percentage
  const calculateCompletion = () => {
    let total = 1;
    let completed = isVideoComplete ? 1 : 0;

    if (day.quiz) {
      total++;
      if (quizSubmitted) completed++;
    }
    if (day.reflectie) {
      total++;
      // Count reflections as complete if we have individual answers or combined answer
      const hasIndividualAnswers = Object.values(reflectionAnswers).some((a) => a && a.length >= 5);
      if (reflectieAnswer.length > 10 || hasIndividualAnswers) completed++;
    }
    if (day.werkboek) {
      total++;
      const allCompleted = werkboekAnswers.every((w) => w.completed);
      if (allCompleted) completed++;
    }

    return Math.round((completed / total) * 100);
  };

  const completionPercent = calculateCompletion();

  // Save progress
  const saveProgress = async (data: Partial<UpdateDayProgressInput>) => {
    setSaving(true);
    try {
      await onProgressUpdate({
        day_id: day.id,
        ...data,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Kon voortgang niet opslaan', {
        description: 'Probeer het later opnieuw',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleVideoComplete = async () => {
    setIsVideoComplete(true);

    // GA4: Track video complete
    trackVideoComplete({
      video_id: `kickstart-day-${day.dag_nummer}-video`,
      video_title: day.titel,
      completion_percentage: 100,
    });

    try {
      await saveProgress({ video_completed: true });
      toast.success('Video afgerond!', {
        description: 'Ga door naar de volgende onderdelen',
      });
    } catch {
      setIsVideoComplete(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, optionIndex: number, isCorrect: boolean) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = { questionIndex, selectedOptionIndex: optionIndex, isCorrect };
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    try {
      await saveProgress({ quiz_answers: quizAnswers, quiz_completed: true });
      const correctCount = quizAnswers.filter(a => a.isCorrect).length;
      const totalQuestions = day.quiz?.vragen.length || 0;
      if (correctCount === totalQuestions) {
        toast.success('Perfect! Alle antwoorden correct!', {
          description: 'Geweldig gedaan!',
        });
      } else {
        toast.success('Quiz voltooid!', {
          description: `${correctCount}/${totalQuestions} correct`,
        });
      }
    } catch {
      setQuizSubmitted(false);
    }
  };

  const handleReflectieSave = async () => {
    try {
      await saveProgress({
        reflectie_antwoord: reflectieAnswer,
        reflectie_completed: reflectieAnswer.length > 10,
      });
      toast.success('Reflectie opgeslagen!', {
        description: 'Iris onthoudt je antwoorden',
      });
    } catch {
      // Error already handled in saveProgress
    }
  };

  // LAAG 3: Save individual reflection to API for Iris context
  const saveIndividualReflection = async (
    questionType: 'spiegel' | 'identiteit' | 'actie',
    questionText: string,
    answerText: string
  ) => {
    if (!answerText || answerText.length < 5) return;

    setSavingReflection(questionType);
    try {
      const response = await fetch('/api/kickstart/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: day.dag_nummer,
          questionType,
          questionText,
          answerText,
          programSlug: 'kickstart',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save reflection:', errorText);
        toast.error('Kon reflectie niet opslaan', {
          description: 'Probeer het later opnieuw',
        });
      } else {
        toast.success('Reflectie bewaard!', {
          description: 'Iris onthoudt dit voor je',
        });
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Kon reflectie niet opslaan', {
        description: 'Controleer je internetverbinding',
      });
    } finally {
      setSavingReflection(null);
    }
  };

  // Handle individual reflection answer change
  const handleReflectionAnswerChange = (questionType: string, value: string) => {
    setReflectionAnswers((prev) => ({
      ...prev,
      [questionType]: value,
    }));

    // Also update combined answer for backwards compatibility
    const allAnswers = { ...reflectionAnswers, [questionType]: value };
    const combined = Object.entries(allAnswers)
      .filter(([_, v]) => v && v.length > 0)
      .map(([type, answer]) => `[${type.toUpperCase()}] ${answer}`)
      .join('\n\n');
    setReflectieAnswer(combined);
  };

  const handleWerkboekToggle = async (index: number) => {
    const newAnswers = [...werkboekAnswers];
    newAnswers[index].completed = !newAnswers[index].completed;
    setWerkboekAnswers(newAnswers);

    const allCompleted = newAnswers.every((w) => w.completed);
    try {
      await saveProgress({
        werkboek_antwoorden: newAnswers,
        werkboek_completed: allCompleted,
      });
      if (allCompleted) {
        toast.success('Werkboek voltooid!', {
          description: 'Alle stappen zijn afgerond',
        });
      }
    } catch {
      // Revert on error
      newAnswers[index].completed = !newAnswers[index].completed;
      setWerkboekAnswers(newAnswers);
    }
  };

  if (!hasAccess) {
    return (
      <Card className="border-pink-100 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-pink-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deze content is vergrendeld</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Koop het Kickstart programma voor toegang tot alle 21 dagen content.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200">
            Koop Kickstart - €47
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Header Card */}
      <Card className="border-pink-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-3xl">{day.emoji}</span>
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    Dag {day.dag_nummer}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 text-xs capitalize">
                    {day.dag_type}
                  </Badge>
                  {day.ai_tool && (
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {day.ai_tool}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold">{day.titel}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/90 bg-white/10 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{day.duur_minuten} min</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <CardContent className="p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Voortgang vandaag</span>
            <span className="text-sm font-semibold text-pink-600">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4 bg-white border border-pink-100 p-1 rounded-xl">
          <TabsTrigger
            value="video"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-lg"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Video</span>
            {isVideoComplete && <CheckCircle className="w-4 h-4 text-green-400" />}
          </TabsTrigger>
          {day.quiz && (
            <TabsTrigger
              value="quiz"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
              {quizSubmitted && <CheckCircle className="w-4 h-4 text-green-400" />}
            </TabsTrigger>
          )}
          {day.reflectie && (
            <TabsTrigger
              value="reflectie"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-lg"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Reflectie</span>
              {reflectieAnswer.length > 10 && <CheckCircle className="w-4 h-4 text-green-400" />}
            </TabsTrigger>
          )}
          {day.werkboek && (
            <TabsTrigger
              value="werkboek"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-lg"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Werkboek</span>
              {werkboekAnswers.every((w) => w.completed) && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Video Tab */}
        <TabsContent value="video" className="mt-6">
          <Card className="border-pink-100 shadow-sm">
            <CardContent className="p-6">
              {day.video_url ? (
                <div className="aspect-video bg-gray-900 rounded-xl mb-6 overflow-hidden shadow-lg">
                  <video
                    controls
                    className="w-full h-full"
                    poster={day.video_thumbnail || undefined}
                    preload="metadata"
                  >
                    <source src={day.video_url} type="video/mp4" />
                    Je browser ondersteunt geen video playback.
                  </video>
                </div>
              ) : day.video_script ? (
                <div className="space-y-6">
                  {/* Hook */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100">
                    <p className="text-lg font-medium text-gray-900 italic">
                      "{day.video_script.hook}"
                    </p>
                  </div>

                  {/* Intro */}
                  <p className="text-gray-700 leading-relaxed">{day.video_script.intro}</p>

                  {/* Sections */}
                  {day.video_script.secties.map((sectie, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">{sectie.titel}</h3>
                      <p className="text-gray-700 leading-relaxed">{sectie.content}</p>
                    </div>
                  ))}

                  {/* Opdracht */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                    <h3 className="font-semibold text-pink-900 mb-2 flex items-center gap-2">
                      <span>📝</span> Opdracht van vandaag
                    </h3>
                    <p className="text-pink-800">{day.video_script.opdracht}</p>
                  </div>

                  {/* Outro */}
                  {day.video_script.outro && (
                    <p className="text-gray-600 italic">{day.video_script.outro}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-pink-400" />
                  </div>
                  <p className="text-gray-500">Video content komt binnenkort beschikbaar.</p>
                </div>
              )}

              {!isVideoComplete && (
                <Button
                  onClick={handleVideoComplete}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-200"
                  disabled={saving}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Markeer als bekeken
                </Button>
              )}

              {isVideoComplete && (
                <div className="flex items-center justify-center gap-2 text-pink-600 mt-6 p-4 bg-pink-50 rounded-xl border border-pink-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Video voltooid!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        {day.quiz && (
          <TabsContent value="quiz" className="mt-6">
            <Card className="border-pink-100 shadow-sm">
              <CardHeader className="border-b border-pink-50">
                <CardTitle className="text-xl text-gray-900">Quiz - Test je kennis</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {day.quiz.vragen.map((vraag, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-6 rounded-xl border-2 border-pink-100 bg-white"
                  >
                    <p className="font-semibold text-gray-900 mb-4">
                      {qIndex + 1}. {vraag.vraag}
                    </p>

                    <div className="space-y-2">
                      {vraag.opties.map((optie, oIndex) => {
                        const isSelected = quizAnswers[qIndex]?.selectedOptionIndex === oIndex;
                        const showResult = quizSubmitted;
                        const isCorrect = optie.correct;

                        return (
                          <button
                            key={oIndex}
                            onClick={() => !quizSubmitted && handleQuizAnswer(qIndex, oIndex, isCorrect)}
                            disabled={quizSubmitted}
                            className={cn(
                              'w-full p-4 rounded-xl text-left transition-all font-medium',
                              showResult
                                ? isCorrect
                                  ? 'bg-green-100 border-2 border-green-500 text-green-800'
                                  : isSelected
                                    ? 'bg-red-100 border-2 border-red-500 text-red-800'
                                    : 'bg-gray-50 border border-gray-200 text-gray-600'
                                : isSelected
                                  ? 'bg-pink-100 border-2 border-pink-500 text-pink-800'
                                  : 'bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                            )}
                          >
                            {optie.tekst}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div
                        className={cn(
                          'mt-4 p-4 rounded-xl',
                          quizAnswers[qIndex]?.isCorrect
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        )}
                      >
                        {quizAnswers[qIndex]?.isCorrect
                          ? vraag.feedback_correct
                          : vraag.feedback_incorrect}
                      </div>
                    )}
                  </div>
                ))}

                {!quizSubmitted && quizAnswers.length === day.quiz.vragen.length && (
                  <Button
                    onClick={handleQuizSubmit}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200"
                    disabled={saving}
                  >
                    Controleer antwoorden
                  </Button>
                )}

                {quizSubmitted && (
                  <div className="text-center p-6 bg-pink-50 rounded-xl border border-pink-200">
                    <p className="text-xl font-bold text-pink-600">
                      Score: {quizAnswers.filter((a) => a.isCorrect).length} / {day.quiz.vragen.length} correct
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Reflectie Tab - Transformationele Vragen */}
        {day.reflectie && (
          <TabsContent value="reflectie" className="mt-6">
            <Card className="border-pink-100 shadow-sm">
              <CardHeader className="border-b border-pink-50">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <span>Reflectie</span>
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    Transformatie
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Neem de tijd voor deze vragen. De echte groei zit in eerlijke zelfreflectie.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Check if new format (vragen array) or old format (single vraag) */}
                {day.reflectie.vragen ? (
                  // New transformational format with 3 questions - individual answer per question
                  <div className="space-y-6">
                    {day.reflectie.vragen.map((vraag: { type: string; vraag: string; doel: string }, index: number) => {
                      const questionType = vraag.type as 'spiegel' | 'identiteit' | 'actie';
                      const currentAnswer = reflectionAnswers[questionType] || '';
                      const isSaving = savingReflection === questionType;
                      const hasAnswer = currentAnswer.length >= 5;

                      return (
                        <div
                          key={index}
                          className={cn(
                            'p-5 rounded-xl border-2 transition-all',
                            vraag.type === 'spiegel' && 'bg-amber-50/50 border-amber-200',
                            vraag.type === 'identiteit' && 'bg-purple-50/50 border-purple-200',
                            vraag.type === 'actie' && 'bg-emerald-50/50 border-emerald-200'
                          )}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                                vraag.type === 'spiegel' && 'bg-amber-200 text-amber-800',
                                vraag.type === 'identiteit' && 'bg-purple-200 text-purple-800',
                                vraag.type === 'actie' && 'bg-emerald-200 text-emerald-800'
                              )}
                            >
                              {vraag.type === 'spiegel' && '🪞'}
                              {vraag.type === 'identiteit' && '🎯'}
                              {vraag.type === 'actie' && '⚡'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={cn(
                                    'text-xs font-semibold uppercase tracking-wide',
                                    vraag.type === 'spiegel' && 'text-amber-700',
                                    vraag.type === 'identiteit' && 'text-purple-700',
                                    vraag.type === 'actie' && 'text-emerald-700'
                                  )}
                                >
                                  {vraag.type === 'spiegel' && 'Spiegel'}
                                  {vraag.type === 'identiteit' && 'Identiteit'}
                                  {vraag.type === 'actie' && 'Actie'}
                                </span>
                              </div>
                              <p className="font-medium text-gray-900">{vraag.vraag}</p>
                            </div>
                          </div>

                          {/* Individual textarea per question */}
                          <div className="mt-4 space-y-2">
                            <Textarea
                              value={currentAnswer}
                              onChange={(e) => handleReflectionAnswerChange(questionType, e.target.value)}
                              placeholder={
                                vraag.type === 'spiegel'
                                  ? 'Wat herken je bij jezelf? Wees eerlijk...'
                                  : vraag.type === 'identiteit'
                                    ? 'Hoe wil je jezelf zien? Beschrijf je ideale ik...'
                                    : 'Welke concrete stap kun je nemen? Wees specifiek...'
                              }
                              className={cn(
                                'min-h-[100px] bg-white/80',
                                vraag.type === 'spiegel' && 'border-amber-300 focus:border-amber-400 focus:ring-amber-400',
                                vraag.type === 'identiteit' && 'border-purple-300 focus:border-purple-400 focus:ring-purple-400',
                                vraag.type === 'actie' && 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400'
                              )}
                            />
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                {currentAnswer.length < 5
                                  ? 'Minimaal 5 tekens'
                                  : `${currentAnswer.length} tekens`}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => saveIndividualReflection(questionType, vraag.vraag, currentAnswer)}
                                disabled={!hasAnswer || isSaving}
                                className={cn(
                                  'text-xs',
                                  vraag.type === 'spiegel' && 'border-amber-300 text-amber-700 hover:bg-amber-100',
                                  vraag.type === 'identiteit' && 'border-purple-300 text-purple-700 hover:bg-purple-100',
                                  vraag.type === 'actie' && 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                )}
                              >
                                {isSaving ? (
                                  'Opslaan...'
                                ) : (
                                  <>
                                    <Save className="w-3 h-3 mr-1" />
                                    Bewaar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Save all reflections button */}
                    <div className="pt-4 border-t border-pink-100">
                      <Button
                        onClick={async () => {
                          // Save all individual reflections + combined progress
                          setSaving(true);
                          try {
                            // Save each individual reflection
                            if (day.reflectie?.vragen) {
                              for (const vraag of day.reflectie.vragen) {
                                const answer = reflectionAnswers[vraag.type];
                                if (answer && answer.length >= 5) {
                                  await saveIndividualReflection(
                                    vraag.type as 'spiegel' | 'identiteit' | 'actie',
                                    vraag.vraag,
                                    answer
                                  );
                                }
                              }
                            }
                            // Also save combined progress
                            await handleReflectieSave();
                          } finally {
                            setSaving(false);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200"
                        disabled={saving || Object.values(reflectionAnswers).filter((a) => a && a.length >= 5).length === 0}
                      >
                        {saving ? 'Opslaan...' : 'Alle antwoorden opslaan'}
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Iris onthoudt je antwoorden en kan hier later naar refereren.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Old format - single question (backwards compatible)
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                      <p className="font-semibold text-pink-900 mb-2">{day.reflectie.vraag}</p>
                      <p className="text-sm text-pink-700">Doel: {day.reflectie.doel}</p>
                    </div>

                    <Textarea
                      value={reflectieAnswer}
                      onChange={(e) => setReflectieAnswer(e.target.value)}
                      placeholder="Schrijf je antwoord hier..."
                      className="min-h-[200px] border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />

                    <Button
                      onClick={handleReflectieSave}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200"
                      disabled={saving || reflectieAnswer.length < 10}
                    >
                      {saving ? 'Opslaan...' : 'Opslaan'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Werkboek Tab */}
        {day.werkboek && (
          <TabsContent value="werkboek" className="mt-6">
            <Card className="border-pink-100 shadow-sm">
              <CardHeader className="border-b border-pink-50">
                <CardTitle className="text-xl text-gray-900">{day.werkboek.titel}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {werkboekAnswers.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleWerkboekToggle(index)}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                        item.completed
                          ? 'bg-pink-50 border-pink-300'
                          : 'bg-white border-pink-100 hover:border-pink-300'
                      )}
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => handleWerkboekToggle(index)}
                        className="mt-1 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                      <span
                        className={cn(
                          'flex-1',
                          item.completed ? 'text-pink-700 line-through' : 'text-gray-700'
                        )}
                      >
                        {item.stap}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-pink-50 rounded-xl border border-pink-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-pink-700">Voortgang</span>
                    <span className="font-semibold text-pink-600">
                      {werkboekAnswers.filter((w) => w.completed).length} / {werkboekAnswers.length}
                    </span>
                  </div>
                  <Progress
                    value={(werkboekAnswers.filter((w) => w.completed).length / werkboekAnswers.length) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-pink-100">
        {navigation.previous ? (
          <Button
            variant="outline"
            onClick={() => onNavigate(navigation.previous!.dag_nummer)}
            className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Dag {navigation.previous.dag_nummer}</span>
          </Button>
        ) : (
          <div />
        )}

        {navigation.next ? (
          <Button
            onClick={() => onNavigate(navigation.next!.dag_nummer)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200"
          >
            <span className="hidden sm:inline">Dag {navigation.next.dag_nummer}:</span>
            <span className="sm:ml-1 truncate max-w-[150px]">{navigation.next.titel}</span>
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg">
            🎉 Programma voltooid!
          </Button>
        )}
      </div>
    </div>
  );
}
