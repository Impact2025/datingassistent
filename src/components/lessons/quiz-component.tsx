'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Trophy,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import type { QuizData, QuizQuestion, QuizAnswer } from '@/types/content-delivery.types';

interface QuizComponentProps {
  quizData: QuizData;
  lessonId: number;
  onComplete: (score: number, passed: boolean, answers: QuizAnswer[]) => void;
  initialAnswers?: QuizAnswer[];
  maxAttempts?: number;
  currentAttempts?: number;
}

export function QuizComponent({
  quizData,
  lessonId,
  onComplete,
  initialAnswers = [],
  maxAttempts,
  currentAttempts = 0
}: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(initialAnswers);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const questions = quizData.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const passingScore = quizData.passing_score || 70;
  const allowRetries = quizData.allow_retries !== false;
  const hasMaxAttempts = maxAttempts && maxAttempts > 0;
  const attemptsRemaining = hasMaxAttempts ? maxAttempts - currentAttempts : null;

  const handleAnswerSelect = (answer: string | number) => {
    if (showFeedback) return; // Prevent changing answer after submission
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = currentQuestion.correct_answer !== undefined &&
                     selectedAnswer === currentQuestion.correct_answer;

    const answer: QuizAnswer = {
      question_id: currentQuestion.id,
      user_answer: selectedAnswer,
      is_correct: isCorrect,
      points_earned: isCorrect ? (currentQuestion.points || 1) : 0
    };

    setAnswers([...answers, answer]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz complete
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const allAnswers = [...answers];
    if (selectedAnswer !== null) {
      const isCorrect = currentQuestion.correct_answer !== undefined &&
                       selectedAnswer === currentQuestion.correct_answer;
      allAnswers.push({
        question_id: currentQuestion.id,
        user_answer: selectedAnswer,
        is_correct: isCorrect,
        points_earned: isCorrect ? (currentQuestion.points || 1) : 0
      });
    }

    // Calculate final score
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const earnedPoints = allAnswers.reduce((sum, a) => sum + (a.points_earned || 0), 0);
    const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);

    setFinalScore(scorePercentage);
    setQuizComplete(true);

    const passed = scorePercentage >= passingScore;
    onComplete(scorePercentage, passed, allAnswers);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuizComplete(false);
    setFinalScore(null);
  };

  const currentAnswer = answers.find(a => a.question_id === currentQuestion.id);
  const isAnswered = currentAnswer !== undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Quiz Results Screen
  if (quizComplete && finalScore !== null) {
    const passed = finalScore >= passingScore;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card className={`border-2 ${passed ? 'border-green-500' : 'border-yellow-500'}`}>
          <CardContent className="p-8 text-center space-y-6">
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {passed ? (
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl">
                  <RotateCcw className="w-12 h-12 text-white" />
                </div>
              )}
            </motion.div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {passed ? 'Gefeliciteerd! 🎉' : 'Nog niet gelukt'}
              </h2>
              <p className="text-lg text-gray-600">
                {passed
                  ? 'Je hebt de quiz succesvol voltooid!'
                  : `Je hebt ${passingScore}% nodig om te slagen.`
                }
              </p>
            </div>

            {/* Score */}
            <div className="py-6">
              <div className="text-6xl font-bold mb-2">
                <span className={passed ? 'text-green-600' : 'text-yellow-600'}>
                  {finalScore}%
                </span>
              </div>
              <p className="text-gray-600">
                {answers.filter(a => a.is_correct).length} van {questions.length} correct
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!passed && allowRetries && (
                <>
                  {hasMaxAttempts && attemptsRemaining !== null && (
                    <p className="text-sm text-gray-600">
                      Je hebt nog {attemptsRemaining} {attemptsRemaining === 1 ? 'poging' : 'pogingen'}
                    </p>
                  )}
                  {(!hasMaxAttempts || attemptsRemaining! > 0) && (
                    <Button
                      onClick={handleRetry}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                      size="lg"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Probeer opnieuw
                    </Button>
                  )}
                </>
              )}

              {passed && (
                <Badge className="bg-green-500 text-white text-lg px-6 py-3">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Les voltooid!
                </Badge>
              )}
            </div>

            {/* Feedback */}
            {currentQuestion.explanation && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-gray-900 mb-2">Uitleg:</p>
                <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Quiz Question Screen
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Vraag {currentQuestionIndex + 1} van {questions.length}</span>
          <span>{Math.round(progress)}% voltooid</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold flex-shrink-0">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {currentQuestion.question}
                  </CardTitle>
                  {currentQuestion.points && currentQuestion.points > 1 && (
                    <Badge variant="outline" className="mt-2">
                      {currentQuestion.points} punten
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Multiple Choice Options */}
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = currentQuestion.correct_answer === index;
                    const showCorrect = showFeedback && isCorrect;
                    const showIncorrect = showFeedback && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          showCorrect
                            ? 'border-green-500 bg-green-50'
                            : showIncorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                        whileHover={!showFeedback ? { scale: 1.02 } : {}}
                        whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex-1">{option}</span>
                          {showCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                          {showIncorrect && (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* True/False Options */}
              {currentQuestion.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-3">
                  {['Waar', 'Onwaar'].map((option, index) => {
                    const value = index === 0 ? 'true' : 'false';
                    const isSelected = selectedAnswer === value;
                    const isCorrect = currentQuestion.correct_answer === value;
                    const showCorrect = showFeedback && isCorrect;
                    const showIncorrect = showFeedback && isSelected && !isCorrect;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(value)}
                        disabled={showFeedback}
                        className={`p-6 rounded-lg border-2 text-center font-semibold transition-all ${
                          showCorrect
                            ? 'border-green-500 bg-green-50'
                            : showIncorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Explanation (after answer) */}
              {showFeedback && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Uitleg:</p>
                      <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="pt-4">
                {!showFeedback ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || isSubmitting}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                    size="lg"
                  >
                    Bevestig antwoord
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                    size="lg"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Volgende vraag
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      'Bekijk resultaat'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
