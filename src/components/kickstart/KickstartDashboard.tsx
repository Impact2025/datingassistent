'use client';

/**
 * KickstartDashboard - Clean, minimalist Kickstart view within dashboard
 * Inspired by the professional logout page design
 *
 * @deprecated This component uses inline fetching. For new features,
 * prefer using the SWR hooks from '@/hooks/use-kickstart':
 * - useKickstartProgress() - for overall progress
 * - useKickstartDay(dayNumber) - for specific day content with caching
 * - useKickstartReflections() - for user reflections
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Lock,
  Play,
  ChevronRight,
  ChevronLeft,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface DaySummary {
  dag_nummer: number;
  titel: string;
  dag_type: string;
  status: 'completed' | 'available' | 'in_progress' | 'locked';
  emoji?: string;
}

interface DayDetail {
  id: number;
  dag_nummer: number;
  titel: string;
  emoji: string;
  dag_type: string;
  duur_minuten: number;
  video_url?: string;
  video_script?: {
    hook: string;
    intro: string;
    secties: { titel: string; content: string }[];
    opdracht: string;
    outro?: string;
  };
  quiz?: {
    vragen: {
      vraag: string;
      opties: { tekst: string; correct: boolean }[];
      feedback_correct: string;
      feedback_incorrect: string;
    }[];
  };
  reflectie?: {
    vraag?: string;  // Keep for backwards compatibility
    doel?: string;   // Keep for backwards compatibility
    vragen?: Array<{  // NEW format - transformational questions
      type: 'spiegel' | 'identiteit' | 'actie';
      vraag: string;
      doel: string;
    }>;
  };
  werkboek?: {
    titel: string;
    stappen: string[];
  };
}

interface KickstartDashboardProps {
  onBack?: () => void;
}

export function KickstartDashboard({ onBack }: KickstartDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DaySummary[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [dayProgress, setDayProgress] = useState<any>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [stats, setStats] = useState({ completedDays: 0, totalDays: 21 });

  // Day content state
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [reflectieAnswer, setReflectieAnswer] = useState('');
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [savingReflection, setSavingReflection] = useState<string | null>(null);
  const [werkboekAnswers, setWerkboekAnswers] = useState<{ stap: string; completed: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/kickstart/progress');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.days) {
            setDays(data.days);
            if (data.stats) {
              setStats(data.stats);
            }
            // Auto-select first available day
            const currentDay = data.days.find(
              (d: DaySummary) => d.status === 'available' || d.status === 'in_progress'
            );
            if (currentDay) {
              setSelectedDay(currentDay.dag_nummer);
            } else if (data.days.length > 0) {
              setSelectedDay(data.days[0].dag_nummer);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  // Fetch day detail when selected
  useEffect(() => {
    if (!selectedDay) return;

    const fetchDay = async () => {
      setLoadingDay(true);
      try {
        const response = await fetch(`/api/kickstart/day/${selectedDay}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDayDetail(data.day);
            setDayProgress(data.progress);
            // Reset state for new day
            setIsVideoComplete(data.progress?.video_completed || false);
            setQuizAnswers(data.progress?.quiz_answers || []);
            setQuizSubmitted(data.progress?.quiz_completed || false);
            setReflectieAnswer(data.progress?.reflectie_antwoord || '');
            setWerkboekAnswers(
              data.progress?.werkboek_antwoorden ||
                data.day.werkboek?.stappen.map((stap: string) => ({ stap, completed: false })) ||
                []
            );
          }
        }
      } catch (error) {
        console.error('Error fetching day:', error);
      } finally {
        setLoadingDay(false);
      }
    };
    fetchDay();
  }, [selectedDay]);

  // Save progress helper
  const saveProgress = async (data: any) => {
    if (!dayDetail) return;
    setSaving(true);
    try {
      const response = await fetch('/api/kickstart/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_id: dayDetail.id, ...data }),
      });
      if (response.ok) {
        // Refresh progress
        const progressResponse = await fetch('/api/kickstart/progress');
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          if (progressData.success) {
            setDays(progressData.days);
            if (progressData.stats) setStats(progressData.stats);
          }
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleVideoComplete = async () => {
    setIsVideoComplete(true);
    await saveProgress({ video_completed: true });
  };

  const handleQuizAnswer = (qIndex: number, oIndex: number, isCorrect: boolean) => {
    const newAnswers = [...quizAnswers];
    newAnswers[qIndex] = { questionIndex: qIndex, selectedOptionIndex: oIndex, isCorrect };
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    await saveProgress({ quiz_answers: quizAnswers, quiz_completed: true });
  };

  const handleReflectionAnswerChange = async (questionType: string, value: string) => {
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

    // Auto-save after user finishes typing
    setSavingReflection(questionType);
    await saveProgress({
      reflectie_antwoord: combined,
      reflectie_completed: Object.values({ ...allAnswers, [questionType]: value }).filter(v => v && v.length > 10).length >= 3,
    });
    setSavingReflection(null);
  };

  const handleReflectieSave = async () => {
    await saveProgress({
      reflectie_antwoord: reflectieAnswer,
      reflectie_completed: reflectieAnswer.length > 10,
    });
  };

  const handleWerkboekToggle = async (index: number) => {
    const newAnswers = [...werkboekAnswers];
    newAnswers[index].completed = !newAnswers[index].completed;
    setWerkboekAnswers(newAnswers);
    await saveProgress({
      werkboek_antwoorden: newAnswers,
      werkboek_completed: newAnswers.every((w) => w.completed),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  const progressPercent = Math.round((stats.completedDays / stats.totalDays) * 100);

  return (
    <div className="space-y-8">
      {/* Header - Clean and minimal */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">21 Dagen Kickstart</h2>
          <p className="text-gray-500 mt-1">
            {stats.completedDays} van {stats.totalDays} dagen voltooid
          </p>
        </div>
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="text-gray-500">
            <BookOpen className="w-4 h-4 mr-2" />
            Dating Reis
          </Button>
        )}
      </div>

      {/* Progress bar - Simple */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Voortgang</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-gray-100" />
      </div>

      {/* Main content - Two columns on desktop */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Days list - Left column */}
        <div className="lg:col-span-1 space-y-2">
          {days.map((day) => {
            const isSelected = day.dag_nummer === selectedDay;
            const isLocked = day.status === 'locked';
            const isCompleted = day.status === 'completed';

            return (
              <button
                key={day.dag_nummer}
                onClick={() => !isLocked && setSelectedDay(day.dag_nummer)}
                disabled={isLocked}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  isSelected
                    ? 'bg-pink-50 border-2 border-pink-200'
                    : 'bg-white border border-gray-100 hover:border-gray-200',
                  isLocked && 'opacity-50 cursor-not-allowed'
                )}
              >
                {/* Status icon */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  isCompleted ? 'bg-green-100' : isSelected ? 'bg-pink-100' : 'bg-gray-100'
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <span className="text-sm">{day.dag_nummer}</span>
                  )}
                </div>

                {/* Day info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isLocked ? 'text-gray-400' : 'text-gray-900'
                  )}>
                    {day.titel}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{day.dag_type}</p>
                </div>

                {/* Arrow */}
                {!isLocked && (
                  <ChevronRight className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isSelected ? 'text-pink-500' : 'text-gray-300'
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* Day content - Right column */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {loadingDay ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
              >
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </motion.div>
            ) : dayDetail ? (
              <motion.div
                key={dayDetail.dag_nummer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Day header */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <span>Dag {dayDetail.dag_nummer}</span>
                    <span>·</span>
                    <span className="capitalize">{dayDetail.dag_type}</span>
                    <span>·</span>
                    <span>{dayDetail.duur_minuten} min</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{dayDetail.titel}</h3>
                </div>

                {/* Video section */}
                {dayDetail.video_url && (
                  <Card className="border-gray-100 overflow-hidden">
                    <div className="aspect-video bg-gray-900">
                      <video controls className="w-full h-full" preload="metadata">
                        <source src={dayDetail.video_url} type="video/mp4" />
                      </video>
                    </div>
                  </Card>
                )}

                {/* Video script (if no video) */}
                {!dayDetail.video_url && dayDetail.video_script && (
                  <Card className="border-gray-100">
                    <CardContent className="p-6 space-y-4">
                      <p className="text-gray-600 italic">"{dayDetail.video_script.hook}"</p>
                      <p className="text-gray-700">{dayDetail.video_script.intro}</p>
                      {dayDetail.video_script.secties.map((s, i) => (
                        <div key={i}>
                          <h4 className="font-medium text-gray-900">{s.titel}</h4>
                          <p className="text-gray-600">{s.content}</p>
                        </div>
                      ))}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Opdracht</p>
                        <p className="text-gray-600">{dayDetail.video_script.opdracht}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mark as complete button */}
                {!isVideoComplete ? (
                  <Button
                    onClick={handleVideoComplete}
                    disabled={saving}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Markeer als bekeken
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600 py-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Voltooid</span>
                  </div>
                )}

                {/* Quiz section */}
                {dayDetail.quiz && (
                  <Card className="border-gray-100">
                    <CardContent className="p-6 space-y-4">
                      <h4 className="font-medium text-gray-900">Quiz</h4>
                      {dayDetail.quiz.vragen.map((vraag, qIndex) => (
                        <div key={qIndex} className="space-y-2">
                          <p className="text-gray-700">{qIndex + 1}. {vraag.vraag}</p>
                          <div className="space-y-1">
                            {vraag.opties.map((optie, oIndex) => {
                              const isSelected = quizAnswers[qIndex]?.selectedOptionIndex === oIndex;
                              const showResult = quizSubmitted;
                              return (
                                <button
                                  key={oIndex}
                                  onClick={() => !quizSubmitted && handleQuizAnswer(qIndex, oIndex, optie.correct)}
                                  disabled={quizSubmitted}
                                  className={cn(
                                    'w-full p-3 rounded-lg text-left text-sm border transition-all',
                                    showResult
                                      ? optie.correct
                                        ? 'bg-green-50 border-green-200'
                                        : isSelected
                                          ? 'bg-red-50 border-red-200'
                                          : 'bg-gray-50 border-gray-100'
                                      : isSelected
                                        ? 'bg-pink-50 border-pink-200'
                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                  )}
                                >
                                  {optie.tekst}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {!quizSubmitted && quizAnswers.length === dayDetail.quiz.vragen.length && (
                        <Button onClick={handleQuizSubmit} disabled={saving} className="w-full">
                          Controleer
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Reflectie section - NEW transformational format */}
                {dayDetail.reflectie && (
                  <Card className="border-gray-100">
                    <CardContent className="p-6 space-y-4">
                      <h4 className="font-medium text-gray-900">Reflectie</h4>

                      {/* NEW format - 3 transformational questions */}
                      {dayDetail.reflectie.vragen ? (
                        <div className="space-y-4">
                          {dayDetail.reflectie.vragen.map((vraag, index) => {
                            const questionType = vraag.type as 'spiegel' | 'identiteit' | 'actie';
                            const currentAnswer = reflectionAnswers[questionType] || '';
                            const isSaving = savingReflection === questionType;

                            return (
                              <div
                                key={index}
                                className={cn(
                                  'p-4 rounded-xl border-2',
                                  vraag.type === 'spiegel' && 'bg-amber-50/50 border-amber-200',
                                  vraag.type === 'identiteit' && 'bg-purple-50/50 border-purple-200',
                                  vraag.type === 'actie' && 'bg-emerald-50/50 border-emerald-200'
                                )}
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0',
                                    vraag.type === 'spiegel' && 'bg-amber-100',
                                    vraag.type === 'identiteit' && 'bg-purple-100',
                                    vraag.type === 'actie' && 'bg-emerald-100'
                                  )}>
                                    {vraag.type === 'spiegel' && '🪞'}
                                    {vraag.type === 'identiteit' && '✨'}
                                    {vraag.type === 'actie' && '🎯'}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className={cn(
                                      'font-semibold text-sm mb-1',
                                      vraag.type === 'spiegel' && 'text-amber-900',
                                      vraag.type === 'identiteit' && 'text-purple-900',
                                      vraag.type === 'actie' && 'text-emerald-900'
                                    )}>
                                      {vraag.type === 'spiegel' && 'Spiegel'}
                                      {vraag.type === 'identiteit' && 'Identiteit'}
                                      {vraag.type === 'actie' && 'Actie'}
                                    </h5>
                                    <p className="text-sm text-gray-600">{vraag.doel}</p>
                                  </div>
                                </div>

                                <p className="text-sm font-medium text-gray-900 mb-2">{vraag.vraag}</p>

                                <Textarea
                                  value={currentAnswer}
                                  onChange={(e) => handleReflectionAnswerChange(questionType, e.target.value)}
                                  placeholder="Schrijf hier je antwoord..."
                                  className={cn(
                                    'min-h-[100px] text-sm',
                                    vraag.type === 'spiegel' && 'border-amber-200 focus:border-amber-400',
                                    vraag.type === 'identiteit' && 'border-purple-200 focus:border-purple-400',
                                    vraag.type === 'actie' && 'border-emerald-200 focus:border-emerald-400'
                                  )}
                                />

                                {isSaving && (
                                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Opslaan...
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // OLD format - backwards compatible single question
                        <>
                          <p className="text-gray-600">{dayDetail.reflectie.vraag}</p>
                          <Textarea
                            value={reflectieAnswer}
                            onChange={(e) => setReflectieAnswer(e.target.value)}
                            placeholder="Schrijf hier je antwoord..."
                            className="min-h-[120px]"
                          />
                          <Button
                            onClick={handleReflectieSave}
                            disabled={saving || reflectieAnswer.length < 10}
                            variant="outline"
                            className="w-full"
                          >
                            Opslaan
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Werkboek section */}
                {dayDetail.werkboek && (
                  <Card className="border-gray-100">
                    <CardContent className="p-6 space-y-4">
                      <h4 className="font-medium text-gray-900">{dayDetail.werkboek.titel}</h4>
                      <div className="space-y-2">
                        {werkboekAnswers.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => handleWerkboekToggle(index)}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
                              item.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                            )}
                          >
                            <Checkbox checked={item.completed} />
                            <span className={cn(
                              'text-sm',
                              item.completed && 'line-through text-gray-400'
                            )}>
                              {item.stap}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => selectedDay && selectedDay > 1 && setSelectedDay(selectedDay - 1)}
                    disabled={!selectedDay || selectedDay <= 1}
                    className="text-gray-500"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Vorige
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedDay && selectedDay < 21) {
                        const nextDay = days.find(d => d.dag_nummer === selectedDay + 1);
                        if (nextDay && nextDay.status !== 'locked') {
                          setSelectedDay(selectedDay + 1);
                        }
                      }
                    }}
                    disabled={!selectedDay || selectedDay >= 21 || days.find(d => d.dag_nummer === (selectedDay || 0) + 1)?.status === 'locked'}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    Volgende
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-400"
              >
                Selecteer een dag om te beginnen
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
