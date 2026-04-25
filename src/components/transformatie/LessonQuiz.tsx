'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy, Brain } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question_order: number;
  question_type: string;
  question_text: string;
  options: { label: string; value: string }[];
  explanation?: string;
}

interface QuizResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

interface LessonQuizProps {
  lessonId: number;
  onComplete: (score: number) => void;
  onSkip: () => void;
}

export function LessonQuiz({ lessonId, onComplete, onSkip }: LessonQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/transformatie/quiz?lessonId=${lessonId}`)
      .then(r => r.json())
      .then(data => {
        if (data.questions?.length > 0) {
          setQuestions(data.questions);
          setBestScore(data.bestScore);
        }
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectAnswer = (value: string) => {
    if (showFeedback) return;
    setSelectedAnswer(value);
  };

  const handleConfirm = () => {
    if (!selectedAnswer) return;
    const newAnswers = { ...answers, [currentQuestion.id]: selectedAnswer };
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await submitQuiz({ ...answers, [currentQuestion.id]: selectedAnswer! });
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const submitQuiz = async (finalAnswers: Record<number, string>) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/transformatie/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, answers: finalAnswers }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setFinalScore(data.score);
        onComplete(data.score);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowFeedback(false);
    setResults(null);
    setFinalScore(null);
  };

  if (results && finalScore !== null) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {finalScore === 100 ? (
              <Trophy className="w-12 h-12 text-yellow-500" />
            ) : (
              <Brain className="w-12 h-12 text-purple-500" />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {finalScore === 100 ? 'Perfect! 🎉' : finalScore >= 67 ? 'Goed gedaan!' : 'Bijna!'}
          </h3>
          <p className="text-3xl font-black text-purple-600">{finalScore}%</p>
          {bestScore !== null && finalScore > bestScore && (
            <p className="text-xs text-green-600 mt-1 font-medium">↑ Nieuwe beste score!</p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {results.map((r) => (
            <div key={r.questionId} className={`rounded-xl p-3 border ${r.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-2 mb-1">
                {r.isCorrect
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                }
                <p className="text-xs font-medium text-gray-700">{r.questionText}</p>
              </div>
              {!r.isCorrect && (
                <p className="text-xs text-gray-500 ml-6">Correct: <span className="font-medium text-gray-700">{r.correctAnswer}</span></p>
              )}
              {r.explanation && (
                <p className="text-xs text-gray-500 ml-6 mt-1 italic">{r.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-purple-300 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Opnieuw
          </button>
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            Ga naar reflectie →
          </button>
        </div>
      </motion.div>
    );
  }

  const isCorrect = showFeedback && selectedAnswer === currentQuestion.correct_answer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-purple-200 bg-white p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Kennischeck</span>
        </div>
        <div className="flex items-center gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i < currentIndex ? 'w-5 bg-purple-400'
              : i === currentIndex ? 'w-5 bg-purple-600'
              : 'w-3 bg-purple-200'
            }`} />
          ))}
        </div>
        <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Overslaan
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm font-semibold text-gray-800 mb-4 leading-relaxed">
            {currentQuestion.question_text}
          </p>

          <div className="space-y-2 mb-4">
            {currentQuestion.options.map((option) => {
              let className = 'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ';
              if (!showFeedback) {
                className += selectedAnswer === option.value
                  ? 'border-purple-500 bg-purple-50 text-purple-800 font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50/50';
              } else {
                if (option.value === currentQuestion.correct_answer) {
                  className += 'border-green-400 bg-green-50 text-green-800 font-medium';
                } else if (option.value === selectedAnswer && !isCorrect) {
                  className += 'border-red-300 bg-red-50 text-red-700';
                } else {
                  className += 'border-gray-200 bg-gray-50 text-gray-400';
                }
              }

              return (
                <button
                  key={option.value}
                  className={className}
                  onClick={() => handleSelectAnswer(option.value)}
                  disabled={showFeedback}
                >
                  <div className="flex items-center gap-2">
                    {showFeedback && option.value === currentQuestion.correct_answer && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                    {showFeedback && option.value === selectedAnswer && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showFeedback && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 mb-4 text-xs leading-relaxed ${isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}
              >
                {currentQuestion.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {!showFeedback ? (
            <button
              onClick={handleConfirm}
              disabled={!selectedAnswer}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Controleer antwoord
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  {isLastQuestion ? 'Bekijk resultaten' : 'Volgende vraag'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
