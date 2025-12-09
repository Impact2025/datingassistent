'use client';

/**
 * KickstartDashboardView - Two-panel layout voor Kickstart in dashboard
 * Links: Week/Dag navigatie | Rechts: Dag content
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  CheckCircle,
  BookOpen,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Clock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { WeekSidebar, type DaySummary } from './WeekSidebar';
import { cn } from '@/lib/utils';
import type {
  ProgramDay,
  DayProgress,
  QuizAnswer,
  WerkboekAnswer,
} from '@/types/kickstart.types';

interface KickstartDashboardViewProps {
  userId?: number;
  onBack?: () => void;
}

export function KickstartDashboardView({ userId, onBack }: KickstartDashboardViewProps) {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daySummaries, setDaySummaries] = useState<DaySummary[]>([]);
  const [currentDayNumber, setCurrentDayNumber] = useState(1);
  const [currentDay, setCurrentDay] = useState<ProgramDay | null>(null);
  const [dayProgress, setDayProgress] = useState<DayProgress | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Day content state
  const [activeTab, setActiveTab] = useState<'video' | 'quiz' | 'reflectie' | 'werkboek'>('video');
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [reflectieAnswer, setReflectieAnswer] = useState('');
  const [reflectieAnswers, setReflectieAnswers] = useState<Record<number, string>>({});
  const [werkboekAnswers, setWerkboekAnswers] = useState<WerkboekAnswer[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch day summaries (for sidebar)
  const fetchDaySummaries = useCallback(async () => {
    try {
      const response = await fetch('/api/kickstart/progress');
      if (!response.ok) throw new Error('Failed to fetch progress');

      const data = await response.json();

      if (data.success && data.days) {
        setDaySummaries(data.days);

        // Find next available day to start with
        const nextDay = data.days.find(
          (d: DaySummary) => d.status === 'available' || d.status === 'in_progress'
        );
        if (nextDay) {
          setCurrentDayNumber(nextDay.dag_nummer);
        }
      }
    } catch (err) {
      console.error('Error fetching day summaries:', err);
      setError('Kon voortgang niet laden');
    }
  }, []);

  // Fetch full day content
  const fetchDayContent = useCallback(async (dayNumber: number) => {
    setLoadingDay(true);
    setActiveTab('video');

    try {
      const response = await fetch(`/api/kickstart/day/${dayNumber}`);
      if (!response.ok) throw new Error('Failed to fetch day');

      const data = await response.json();

      if (data.success) {
        setCurrentDay(data.day);
        setDayProgress(data.progress);

        // Reset state for new day
        setIsVideoComplete(data.progress?.video_completed || false);
        setQuizAnswers(data.progress?.quiz_answers || []);
        setQuizSubmitted(data.progress?.quiz_completed || false);
        setReflectieAnswer(data.progress?.reflectie_antwoord || '');
        setReflectieAnswers(data.progress?.reflectie_antwoorden || {});
        setWerkboekAnswers(
          data.progress?.werkboek_antwoorden ||
            data.day.werkboek?.stappen.map((stap: string) => ({
              stap,
              antwoord: '',
              completed: false,
            })) ||
            []
        );
      }
    } catch (err) {
      console.error('Error fetching day:', err);
      setError('Kon dag niet laden');
    } finally {
      setLoadingDay(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDaySummaries();
      setLoading(false);
    };
    init();
  }, [fetchDaySummaries]);

  // Load day content when day changes
  useEffect(() => {
    if (currentDayNumber > 0 && !loading) {
      fetchDayContent(currentDayNumber);
    }
  }, [currentDayNumber, fetchDayContent, loading]);

  // Save progress helper
  const saveProgress = async (data: Record<string, any>) => {
    if (!currentDay) return;

    setSaving(true);
    try {
      await fetch('/api/kickstart/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_id: currentDay.id,
          ...data,
        }),
      });

      // Refresh summaries to update sidebar
      await fetchDaySummaries();
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setSaving(false);
    }
  };

  // Video completion handler
  const handleVideoComplete = async () => {
    setIsVideoComplete(true);
    await saveProgress({ video_completed: true });
  };

  // Quiz handlers
  const handleQuizAnswer = (questionIndex: number, optionIndex: number, isCorrect: boolean) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = { questionIndex, selectedOptionIndex: optionIndex, isCorrect };
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    await saveProgress({ quiz_answers: quizAnswers, quiz_completed: true });
  };

  // Reflectie handler (single question)
  const handleReflectieSave = async () => {
    await saveProgress({
      reflectie_antwoord: reflectieAnswer,
      reflectie_completed: reflectieAnswer.length > 10,
    });
  };

  // Reflectie handler (multiple questions)
  const handleReflectieItemSave = async (index: number, answer: string) => {
    const newAnswers = { ...reflectieAnswers, [index]: answer };
    setReflectieAnswers(newAnswers);

    const vragen = currentDay?.reflectie?.vragen || [];
    const allAnswered = vragen.every((_, i) => (newAnswers[i]?.length || 0) > 10);

    await saveProgress({
      reflectie_antwoorden: newAnswers,
      reflectie_completed: allAnswered,
    });
  };

  // Werkboek handler
  const handleWerkboekToggle = async (index: number) => {
    const newAnswers = [...werkboekAnswers];
    newAnswers[index].completed = !newAnswers[index].completed;
    setWerkboekAnswers(newAnswers);

    await saveProgress({
      werkboek_antwoorden: newAnswers,
      werkboek_completed: newAnswers.every((w) => w.completed),
    });
  };

  // Day navigation
  const handleSelectDay = (dayNumber: number) => {
    setCurrentDayNumber(dayNumber);
    setSidebarOpen(false);
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!currentDay) return 0;

    let total = 1;
    let completed = isVideoComplete ? 1 : 0;

    if (currentDay.quiz) {
      total++;
      if (quizSubmitted) completed++;
    }
    if (currentDay.reflectie) {
      total++;
      // Check multiple questions (vragen) or single question (vraag)
      if (currentDay.reflectie.vragen && currentDay.reflectie.vragen.length > 0) {
        const allAnswered = currentDay.reflectie.vragen.every(
          (_, i) => (reflectieAnswers[i]?.length || 0) > 10
        );
        if (allAnswered) completed++;
      } else if (reflectieAnswer.length > 10) {
        completed++;
      }
    }
    if (currentDay.werkboek) {
      total++;
      if (werkboekAnswers.every((w) => w.completed)) completed++;
    }

    return Math.round((completed / total) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Kickstart laden...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Er ging iets mis
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Opnieuw proberen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercent = calculateCompletion();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)] gap-6">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
        <div>
          <h2 className="font-bold text-gray-900">Dag {currentDayNumber}</h2>
          <p className="text-sm text-gray-600">{currentDay?.titel}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar - animated slide-in */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[320px]"
          >
            <div className="h-full p-4 bg-gray-100 overflow-y-auto">
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <WeekSidebar
                days={daySummaries}
                currentDay={currentDayNumber}
                onSelectDay={handleSelectDay}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - always visible on lg screens, first in flex order */}
      <div className="hidden lg:block w-[340px] flex-shrink-0 order-first">
        <div className="sticky top-4">
          <WeekSidebar
            days={daySummaries}
            currentDay={currentDayNumber}
            onSelectDay={handleSelectDay}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {loadingDay ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : currentDay ? (
          <div className="space-y-6">
            {/* Day Header */}
            <Card className="border-pink-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center">
                      <span className="text-3xl">{currentDay.emoji}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-pink-500 text-white text-xs border-0">
                          Dag {currentDay.dag_nummer}
                        </Badge>
                        <Badge className="bg-pink-100 text-pink-700 text-xs border-0 capitalize">
                          {currentDay.dag_type}
                        </Badge>
                        {currentDay.ai_tool && (
                          <Badge className="bg-pink-100 text-pink-700 text-xs border-0">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {currentDay.ai_tool}
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        {currentDay.titel}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4" />
                    {currentDay.duur_minuten} min
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Voortgang vandaag</span>
                    <span className="font-semibold text-pink-600">{completionPercent}%</span>
                  </div>
                  <Progress value={completionPercent} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="video" className="flex items-center gap-1 text-xs lg:text-sm">
                  <Play className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Video</span>
                  {isVideoComplete && <CheckCircle className="w-3 h-3 text-green-500" />}
                </TabsTrigger>
                {currentDay.quiz && (
                  <TabsTrigger value="quiz" className="flex items-center gap-1 text-xs lg:text-sm">
                    <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Quiz</span>
                    {quizSubmitted && <CheckCircle className="w-3 h-3 text-green-500" />}
                  </TabsTrigger>
                )}
                {currentDay.reflectie && (
                  <TabsTrigger value="reflectie" className="flex items-center gap-1 text-xs lg:text-sm">
                    <BookOpen className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Reflectie</span>
                    {(() => {
                      // Check multiple questions (vragen) or single question (vraag)
                      if (currentDay.reflectie.vragen && currentDay.reflectie.vragen.length > 0) {
                        const allAnswered = currentDay.reflectie.vragen.every(
                          (_, i) => (reflectieAnswers[i]?.length || 0) > 10
                        );
                        return allAnswered && <CheckCircle className="w-3 h-3 text-green-500" />;
                      }
                      return reflectieAnswer.length > 10 && <CheckCircle className="w-3 h-3 text-green-500" />;
                    })()}
                  </TabsTrigger>
                )}
                {currentDay.werkboek && (
                  <TabsTrigger value="werkboek" className="flex items-center gap-1 text-xs lg:text-sm">
                    <ClipboardList className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Werkboek</span>
                    {werkboekAnswers.every((w) => w.completed) && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Video Tab */}
              <TabsContent value="video">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    {currentDay.video_url ? (
                      <div className="aspect-video bg-gray-900 rounded-lg mb-6 overflow-hidden">
                        <video
                          controls
                          className="w-full h-full"
                          poster={currentDay.video_thumbnail || undefined}
                          preload="metadata"
                        >
                          <source src={currentDay.video_url} type="video/mp4" />
                          Je browser ondersteunt geen video playback.
                        </video>
                      </div>
                    ) : currentDay.video_script ? (
                      <div className="space-y-6">
                        {/* Hook */}
                        <div className="bg-pink-50 p-4 lg:p-6 rounded-lg border border-pink-200">
                          <p className="text-base lg:text-lg font-medium text-gray-900 italic">
                            "{currentDay.video_script.hook}"
                          </p>
                        </div>

                        {/* Intro */}
                        <p className="text-gray-700">{currentDay.video_script.intro}</p>

                        {/* Sections */}
                        {currentDay.video_script.secties?.map((sectie, index) => (
                          <div key={index} className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {sectie.titel}
                            </h3>
                            <p className="text-gray-700">{sectie.content}</p>
                          </div>
                        ))}

                        {/* Opdracht */}
                        {currentDay.video_script.opdracht && (
                          <div className="bg-pink-50 p-4 lg:p-6 rounded-lg border border-pink-200">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Opdracht van vandaag
                            </h3>
                            <p className="text-gray-700">{currentDay.video_script.opdracht}</p>
                          </div>
                        )}

                        {/* Outro */}
                        {currentDay.video_script.outro && (
                          <p className="text-gray-600 italic">{currentDay.video_script.outro}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-12">
                        Video content komt binnenkort beschikbaar.
                      </p>
                    )}

                    {!isVideoComplete && (
                      <Button
                        onClick={handleVideoComplete}
                        className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white"
                        disabled={saving}
                      >
                        Markeer als bekeken
                      </Button>
                    )}

                    {isVideoComplete && (
                      <div className="flex items-center justify-center gap-2 text-pink-600 mt-6 p-4 bg-pink-50 rounded-xl border border-pink-200">
                        <CheckCircle className="w-5 h-5" />
                        Video voltooid!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Quiz Tab */}
              {currentDay.quiz && (
                <TabsContent value="quiz">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Quiz - Test je kennis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentDay.quiz.vragen.map((vraag, qIndex) => (
                        <div
                          key={qIndex}
                          className="p-4 rounded-xl border border-gray-200"
                        >
                          <p className="font-medium text-gray-900 mb-3">
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
                                    'w-full p-3 rounded-lg text-left text-sm transition-all',
                                    showResult
                                      ? isCorrect
                                        ? 'bg-green-100 border-green-500 border-2'
                                        : isSelected
                                          ? 'bg-red-100 border-red-500 border-2'
                                          : 'bg-gray-50 border-gray-200 border'
                                      : isSelected
                                        ? 'bg-pink-100 border-pink-500 border-2'
                                        : 'bg-white border-gray-200 border hover:border-pink-300'
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
                                'mt-3 p-3 rounded-lg text-sm',
                                quizAnswers[qIndex]?.isCorrect
                                  ? 'bg-green-50 text-green-800'
                                  : 'bg-red-50 text-red-800'
                              )}
                            >
                              {quizAnswers[qIndex]?.isCorrect
                                ? vraag.feedback_correct
                                : vraag.feedback_incorrect}
                            </div>
                          )}
                        </div>
                      ))}

                      {!quizSubmitted && quizAnswers.length === currentDay.quiz.vragen.length && (
                        <Button
                          onClick={handleQuizSubmit}
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                          disabled={saving}
                        >
                          Controleer antwoorden
                        </Button>
                      )}

                      {quizSubmitted && (
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                          <p className="text-lg font-medium">
                            Score: {quizAnswers.filter((a) => a.isCorrect).length} /{' '}
                            {currentDay.quiz.vragen.length} correct
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Reflectie Tab */}
              {currentDay.reflectie && (
                <TabsContent value="reflectie">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Reflectie</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Multiple reflection questions (vragen array) */}
                      {currentDay.reflectie.vragen && currentDay.reflectie.vragen.length > 0 ? (
                        currentDay.reflectie.vragen.map((vraagItem: any, index: number) => {
                          // Map type to display label
                          const typeLabels: Record<string, string> = {
                            spiegel: 'Spiegel',
                            identiteit: 'Identiteit',
                            actie: 'Actie',
                          };
                          const typeLabel = typeLabels[vraagItem.type] || vraagItem.type;

                          return (
                            <div key={index} className="space-y-3 p-4 rounded-xl border border-gray-200 bg-white">
                              <div className="flex items-start gap-3">
                                <Badge className="bg-pink-100 text-pink-700 text-xs border-0 shrink-0">
                                  {typeLabel}
                                </Badge>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-600">{vraagItem.doel}</p>
                                </div>
                              </div>
                              <p className="text-gray-900 font-medium">{vraagItem.vraag}</p>
                              <Textarea
                                value={reflectieAnswers[index] || ''}
                                onChange={(e) => {
                                  const newAnswers = { ...reflectieAnswers, [index]: e.target.value };
                                  setReflectieAnswers(newAnswers);
                                }}
                                onBlur={() => handleReflectieItemSave(index, reflectieAnswers[index] || '')}
                                placeholder="Schrijf je antwoord hier..."
                                className="min-h-[100px]"
                              />
                              {(reflectieAnswers[index]?.length || 0) > 10 && (
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  Opgeslagen
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        /* Legacy single question format */
                        <>
                          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                            <p className="font-medium text-gray-900">
                              {currentDay.reflectie.vraag}
                            </p>
                            {currentDay.reflectie.doel && (
                              <p className="text-sm text-gray-600 mt-2">
                                Doel: {currentDay.reflectie.doel}
                              </p>
                            )}
                          </div>
                          <Textarea
                            value={reflectieAnswer}
                            onChange={(e) => setReflectieAnswer(e.target.value)}
                            placeholder="Schrijf je antwoord hier..."
                            className="min-h-[150px]"
                          />
                          <Button
                            onClick={handleReflectieSave}
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                            disabled={saving || reflectieAnswer.length < 10}
                          >
                            {saving ? 'Opslaan...' : 'Opslaan'}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Werkboek Tab */}
              {currentDay.werkboek && (
                <TabsContent value="werkboek">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{currentDay.werkboek.titel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {werkboekAnswers.map((item, index) => (
                          <div
                            key={index}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm',
                              item.completed
                                ? 'bg-pink-50 border-pink-200'
                                : 'bg-white border-pink-100 hover:border-pink-300'
                            )}
                            onClick={() => handleWerkboekToggle(index)}
                          >
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => handleWerkboekToggle(index)}
                              className="mt-0.5 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                            />
                            <span
                              className={cn(
                                'text-sm',
                                item.completed ? 'text-pink-700 line-through' : 'text-gray-700'
                              )}
                            >
                              {item.stap}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-100">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Voortgang</span>
                          <span>
                            {werkboekAnswers.filter((w) => w.completed).length} /{' '}
                            {werkboekAnswers.length}
                          </span>
                        </div>
                        <Progress
                          value={
                            (werkboekAnswers.filter((w) => w.completed).length /
                              werkboekAnswers.length) *
                            100
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => currentDayNumber > 1 && handleSelectDay(currentDayNumber - 1)}
                disabled={currentDayNumber <= 1}
                className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Vorige dag</span>
              </Button>

              {currentDayNumber < 21 ? (
                <Button
                  onClick={() => handleSelectDay(currentDayNumber + 1)}
                  disabled={
                    daySummaries.find((d) => d.dag_nummer === currentDayNumber + 1)?.status ===
                    'locked'
                  }
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <span className="hidden sm:inline">Volgende dag</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                  Programma voltooid
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Selecteer een dag om te beginnen</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
