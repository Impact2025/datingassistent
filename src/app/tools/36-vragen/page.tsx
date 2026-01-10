'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Play,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Trophy,
  Eye,
  Zap,
  RefreshCcw,
  Info,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface Session {
  id: number;
  partnerName: string;
  currentSet: number;
  currentQuestion: number;
  status: string;
  createdAt: string;
}

interface Question {
  number: number;
  text: string;
  set: string;
  setNumber: number;
  questionInSet: number;
  totalInSet: number;
  tip?: string;
}

function VragenPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewSession, setShowNewSession] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/36-vragen', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = async () => {
    if (!partnerName.trim()) {
      setError('Vul een naam in voor je gesprekspartner');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/36-vragen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'start_session',
          partnerName: partnerName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kon sessie niet starten');
      }

      setActiveSession(data.session);
      setCurrentQuestion(data.question);
      setShowNewSession(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueSession = async (session: Session) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/36-vragen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'get_question',
          sessionId: session.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kon vraag niet ophalen');
      }

      setActiveSession({
        ...session,
        currentSet: data.question.setNumber,
        currentQuestion: data.question.questionInSet,
      });
      setCurrentQuestion(data.question);

      if (data.question.isComplete) {
        setIsComplete(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAnswer = async () => {
    if (!activeSession || !currentQuestion) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/36-vragen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'answer_question',
          sessionId: activeSession.id,
          answer: answer.trim() || 'Besproken',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kon antwoord niet opslaan');
      }

      setAnswer('');

      if (data.isComplete) {
        setIsComplete(true);
        setCurrentQuestion(null);
      } else if (data.nextQuestion) {
        setCurrentQuestion({
          ...data.nextQuestion,
          tip: data.tip,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exitSession = () => {
    setActiveSession(null);
    setCurrentQuestion(null);
    setIsComplete(false);
    setAnswer('');
    fetchSessions();
  };

  const getSetColor = (setNumber: number) => {
    switch (setNumber) {
      case 1: return 'from-blue-400 to-blue-600';
      case 2: return 'from-amber-400 to-amber-600';
      case 3: return 'from-rose-400 to-rose-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getSetBgColor = (setNumber: number) => {
    switch (setNumber) {
      case 1: return 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700';
      case 2: return 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700';
      case 3: return 'bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-700';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white dark:from-gray-900 dark:to-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => activeSession ? exitSession() : router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">36 Vragen</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeSession ? `Met ${activeSession.partnerName}` : 'Bouw diepere verbinding'}
                  </p>
                </div>
              </div>
            </div>
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-0">
              Transformatie
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* No Active Session - Show Sessions List or New Session Form */}
        {!activeSession && !showNewSession && (
          <>
            {/* Intro Card */}
            <Card className="border-rose-200 dark:border-rose-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center flex-shrink-0">
                    <Info className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">De 36 Vragen om Verliefd te Worden</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Gebaseerd op het onderzoek van Dr. Arthur Aron. Deze vragen zijn ontworpen
                      om intimiteit en verbinding op te bouwen - perfect voor dates of verdieping van bestaande relaties.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Session Button */}
            <Button
              onClick={() => setShowNewSession(true)}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Start nieuwe sessie
            </Button>

            {/* Previous Sessions */}
            {sessions.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                    <MessageCircle className="w-5 h-5 text-rose-500" />
                    Eerdere sessies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => continueSession(session)}
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-rose-300 dark:hover:border-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{session.partnerName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {session.status === 'completed' ? (
                              <span className="text-green-600 dark:text-green-400">Voltooid</span>
                            ) : (
                              `Vraag ${((session.currentSet || 1) - 1) * 12 + (session.currentQuestion || 1)} van 36`
                            )}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* New Session Form */}
        {showNewSession && !activeSession && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                <Users className="w-5 h-5 text-rose-500" />
                Nieuwe sessie starten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Naam van je gesprekspartner
                </label>
                <Input
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Bijv. Lisa, Mark, etc."
                  className="border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewSession(false)}
                  className="flex-1"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={startNewSession}
                  disabled={isSubmitting}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Session - Question View */}
        {activeSession && currentQuestion && !isComplete && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.number}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{currentQuestion.set}</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">
                    Vraag {currentQuestion.number} van 36
                  </span>
                </div>
                <Progress
                  value={(currentQuestion.number / 36) * 100}
                  className="h-2 bg-rose-100"
                />
              </div>

              {/* Question Card */}
              <Card className={cn('border-2', getSetBgColor(currentQuestion.setNumber))}>
                <CardContent className="p-6">
                  <Badge className={cn(
                    'mb-4',
                    currentQuestion.setNumber === 1 && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                    currentQuestion.setNumber === 2 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                    currentQuestion.setNumber === 3 && 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                  )}>
                    Set {currentQuestion.setNumber} - Vraag {currentQuestion.questionInSet}
                  </Badge>

                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </CardContent>
              </Card>

              {/* Tip */}
              {currentQuestion.tip && (
                <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">{currentQuestion.tip}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Answer Area (Optional) */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Noteer je antwoord (optioneel - voor je eigen reflectie)
                  </p>
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Schrijf hier je antwoord..."
                    className="min-h-[100px] border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </CardContent>
              </Card>

              {/* Navigation */}
              <Button
                onClick={submitAnswer}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-6"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Volgende vraag
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Completion Screen */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="border-rose-200 dark:border-rose-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Gefeliciteerd!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Jullie hebben alle 36 vragen doorlopen met {activeSession?.partnerName}.
                </p>

                {/* Final instruction */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-200 dark:border-rose-700 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-rose-500" />
                    Laatste stap
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Neem nu <strong>4 minuten</strong> om in stilte in elkaars ogen te kijken.
                    Dit verdiept de connectie die jullie net hebben opgebouwd.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reflectie Section */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg dark:text-white">Reflectie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border-2 border-pink-200 dark:border-pink-700 bg-pink-50/50 dark:bg-pink-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 border-0 text-xs">Spiegel</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Wat heb je geleerd over {activeSession?.partnerName} dat je nog niet wist?
                  </p>
                </div>

                <div className="p-4 rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0 text-xs">Identiteit</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Welke vraag heeft jou het meest geraakt of verrast?
                  </p>
                </div>

                <div className="p-4 rounded-xl border-2 border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0 text-xs">Actie</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Hoe wil je deze connectie verder verdiepen?
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={exitSession}
                className="flex-1"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Nieuwe sessie
              </Button>
              <Button
                onClick={() => router.push('/transformatie')}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              >
                Terug naar cursus
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

export default function VragenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    }>
      <VragenPageContent />
    </Suspense>
  );
}
