'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  ProgramDay,
  DayProgress,
  QuizAnswer,
  WerkboekAnswer,
  UpdateDayProgressInput,
} from '@/types/kickstart.types';

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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [reflectieAnswer, setReflectieAnswer] = useState(progress?.reflectie_antwoord || '');
  const [werkboekAnswers, setWerkboekAnswers] = useState<WerkboekAnswer[]>(
    progress?.werkboek_antwoorden ||
      day.werkboek?.stappen.map((stap) => ({ stap, antwoord: '', completed: false })) ||
      []
  );
  const [saving, setSaving] = useState(false);

  // Calculate completion percentage
  const calculateCompletion = () => {
    let total = 1; // Video
    let completed = isVideoComplete ? 1 : 0;

    if (day.quiz) {
      total++;
      if (quizSubmitted) completed++;
    }
    if (day.reflectie) {
      total++;
      if (reflectieAnswer.length > 10) completed++;
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
    } finally {
      setSaving(false);
    }
  };

  // Handle video completion
  const handleVideoComplete = async () => {
    setIsVideoComplete(true);
    await saveProgress({ video_completed: true });
  };

  // Handle quiz answer
  const handleQuizAnswer = (questionIndex: number, optionIndex: number, isCorrect: boolean) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = {
      questionIndex,
      selectedOptionIndex: optionIndex,
      isCorrect,
    };
    setQuizAnswers(newAnswers);
  };

  // Submit quiz
  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    await saveProgress({
      quiz_answers: quizAnswers,
      quiz_completed: true,
    });
  };

  // Save reflectie
  const handleReflectieSave = async () => {
    await saveProgress({
      reflectie_antwoord: reflectieAnswer,
      reflectie_completed: reflectieAnswer.length > 10,
    });
  };

  // Toggle werkboek step
  const handleWerkboekToggle = async (index: number) => {
    const newAnswers = [...werkboekAnswers];
    newAnswers[index].completed = !newAnswers[index].completed;
    setWerkboekAnswers(newAnswers);

    const allCompleted = newAnswers.every((w) => w.completed);
    await saveProgress({
      werkboek_antwoorden: newAnswers,
      werkboek_completed: allCompleted,
    });
  };

  if (!hasAccess) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-12 text-center">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Deze content is vergrendeld</h2>
          <p className="text-gray-600 mb-6">
            Koop het Kickstart programma voor toegang tot alle 21 dagen content.
          </p>
          <Button size="lg" className="bg-pink-500 hover:bg-pink-600">
            Koop Kickstart - €47
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{day.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Dag {day.dag_nummer}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {day.dag_type}
              </Badge>
              {day.ai_tool && (
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {day.ai_tool}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold mt-1">{day.titel}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {day.duur_minuten} min
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Voortgang vandaag</span>
          <span className="font-medium">{completionPercent}%</span>
        </div>
        <Progress value={completionPercent} className="h-2" />
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Video
            {isVideoComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
          </TabsTrigger>
          {day.quiz && (
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Quiz
              {quizSubmitted && <CheckCircle className="w-4 h-4 text-green-500" />}
            </TabsTrigger>
          )}
          {day.reflectie && (
            <TabsTrigger value="reflectie" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Reflectie
              {reflectieAnswer.length > 10 && <CheckCircle className="w-4 h-4 text-green-500" />}
            </TabsTrigger>
          )}
          {day.werkboek && (
            <TabsTrigger value="werkboek" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Werkboek
              {werkboekAnswers.every((w) => w.completed) && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Video Tab */}
        <TabsContent value="video">
          <Card>
            <CardContent className="p-6">
              {day.video_url ? (
                <div className="aspect-video bg-gray-900 rounded-lg mb-6">
                  {/* Video player placeholder - integrate with your video provider */}
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Play className="w-16 h-16" />
                  </div>
                </div>
              ) : day.video_script ? (
                <div className="space-y-6">
                  {/* Hook */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-100">
                    <p className="text-lg font-medium text-gray-900 italic">
                      "{day.video_script.hook}"
                    </p>
                  </div>

                  {/* Intro */}
                  <p className="text-gray-700">{day.video_script.intro}</p>

                  {/* Sections */}
                  {day.video_script.secties.map((sectie, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sectie.titel}
                      </h3>
                      <p className="text-gray-700">{sectie.content}</p>
                    </div>
                  ))}

                  {/* Opdracht */}
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      📝 Opdracht van vandaag
                    </h3>
                    <p className="text-blue-800">{day.video_script.opdracht}</p>
                  </div>

                  {/* Outro */}
                  <p className="text-gray-600 italic">{day.video_script.outro}</p>
                </div>
              ) : (
                <p className="text-gray-500">Video content komt binnenkort beschikbaar.</p>
              )}

              {!isVideoComplete && (
                <Button
                  onClick={handleVideoComplete}
                  className="w-full mt-6 bg-green-500 hover:bg-green-600"
                  disabled={saving}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Markeer als bekeken
                </Button>
              )}

              {isVideoComplete && (
                <div className="flex items-center justify-center gap-2 text-green-600 mt-6">
                  <CheckCircle className="w-5 h-5" />
                  Video voltooid!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        {day.quiz && (
          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle>Quiz - Test je kennis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {day.quiz.vragen.map((vraag, qIndex) => (
                  <div
                    key={qIndex}
                    className={`p-6 rounded-xl border ${
                      currentQuestion === qIndex
                        ? 'border-pink-300 bg-pink-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <p className="font-medium text-gray-900 mb-4">
                      {qIndex + 1}. {vraag.vraag}
                    </p>

                    <div className="space-y-2">
                      {vraag.opties.map((optie, oIndex) => {
                        const isSelected =
                          quizAnswers[qIndex]?.selectedOptionIndex === oIndex;
                        const showResult = quizSubmitted;
                        const isCorrect = optie.correct;

                        return (
                          <button
                            key={oIndex}
                            onClick={() =>
                              !quizSubmitted &&
                              handleQuizAnswer(qIndex, oIndex, isCorrect)
                            }
                            disabled={quizSubmitted}
                            className={`w-full p-4 rounded-lg text-left transition-all ${
                              showResult
                                ? isCorrect
                                  ? 'bg-green-100 border-green-500 border-2'
                                  : isSelected
                                    ? 'bg-red-100 border-red-500 border-2'
                                    : 'bg-gray-50 border-gray-200 border'
                                : isSelected
                                  ? 'bg-pink-100 border-pink-500 border-2'
                                  : 'bg-white border-gray-200 border hover:border-pink-300'
                            }`}
                          >
                            {optie.tekst}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div
                        className={`mt-4 p-4 rounded-lg ${
                          quizAnswers[qIndex]?.isCorrect
                            ? 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-800'
                        }`}
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
                    className="w-full bg-pink-500 hover:bg-pink-600"
                    disabled={saving}
                  >
                    Controleer antwoorden
                  </Button>
                )}

                {quizSubmitted && (
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <p className="text-lg font-medium">
                      Score:{' '}
                      {quizAnswers.filter((a) => a.isCorrect).length} /{' '}
                      {day.quiz.vragen.length} correct
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Reflectie Tab */}
        {day.reflectie && (
          <TabsContent value="reflectie">
            <Card>
              <CardHeader>
                <CardTitle>Reflectie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <p className="font-medium text-purple-900">{day.reflectie.vraag}</p>
                  <p className="text-sm text-purple-700 mt-2">
                    Doel: {day.reflectie.doel}
                  </p>
                </div>

                <Textarea
                  value={reflectieAnswer}
                  onChange={(e) => setReflectieAnswer(e.target.value)}
                  placeholder="Schrijf je antwoord hier..."
                  className="min-h-[200px]"
                />

                <Button
                  onClick={handleReflectieSave}
                  className="w-full"
                  disabled={saving || reflectieAnswer.length < 10}
                >
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Werkboek Tab */}
        {day.werkboek && (
          <TabsContent value="werkboek">
            <Card>
              <CardHeader>
                <CardTitle>{day.werkboek.titel}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {werkboekAnswers.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        item.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => handleWerkboekToggle(index)}
                        className="mt-1"
                      />
                      <span
                        className={
                          item.completed ? 'text-green-800 line-through' : 'text-gray-700'
                        }
                      >
                        {item.stap}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
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
      <div className="flex justify-between pt-6 border-t">
        {navigation.previous ? (
          <Button
            variant="outline"
            onClick={() => onNavigate(navigation.previous!.dag_nummer)}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Dag {navigation.previous.dag_nummer}: {navigation.previous.titel}
          </Button>
        ) : (
          <div />
        )}

        {navigation.next ? (
          <Button onClick={() => onNavigate(navigation.next!.dag_nummer)}>
            Dag {navigation.next.dag_nummer}: {navigation.next.titel}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button className="bg-green-500 hover:bg-green-600">
            🎉 Programma voltooid!
          </Button>
        )}
      </div>
    </div>
  );
}
