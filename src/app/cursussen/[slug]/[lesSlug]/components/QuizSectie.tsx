'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

interface QuizSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function QuizSectie({ sectie, isCompleted, onComplete }: QuizSectieProps) {
  const content = sectie.inhoud || {};
  const vragen = sectie.quiz_vragen || [];
  const minimumScore = content.minimumScore || Math.ceil(vragen.length * 0.7); // Default 70%

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (optie: string) => {
    setAnswers({ ...answers, [currentQuestion]: optie });

    // Move to next question automatically
    if (currentQuestion < vragen.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    vragen.forEach((vraag: any, index: number) => {
      if (answers[index] === vraag.correcte_optie) {
        correct++;
      }
    });
    return correct;
  };

  const score = calculateScore();
  const passed = score >= minimumScore;
  const allAnswered = Object.keys(answers).length === vragen.length;

  // If no questions, just show message
  if (vragen.length === 0) {
    return (
      <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Deze quiz heeft nog geen vragen.</p>
        </CardContent>
      </Card>
    );
  }

  // Show results
  if (showResults) {
    return (
      <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'
            }`}>
              {passed ? (
                <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {passed ? 'Gefeliciteerd!' : 'Nog even oefenen'}
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
              Je score: <span className="font-bold text-coral-600 dark:text-coral-400">{score} / {vragen.length}</span>
            </p>
            {passed ? (
              <p className="text-gray-600 dark:text-gray-400">{content.succesMessage || 'Je hebt de quiz gehaald!'}</p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Je hebt minimaal {minimumScore} goede antwoorden nodig. Probeer het opnieuw!
              </p>
            )}
          </div>

          {/* Review answers */}
          <div className="space-y-4 mb-6">
            {vragen.map((vraag: any, index: number) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === vraag.correcte_optie;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30' : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{vraag.vraag}</p>
                      <p className={`text-sm mt-1 ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        Jouw antwoord: {userAnswer}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Correct antwoord: {vraag.correcte_optie}
                        </p>
                      )}
                      {vraag.uitleg && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">{vraag.uitleg}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!passed && (
              <PrimaryButton
                onClick={() => {
                  setAnswers({});
                  setCurrentQuestion(0);
                  setShowResults(false);
                }}
                className="flex-1 bg-coral-500 hover:bg-coral-600 text-white rounded-full"
              >
                Opnieuw proberen
              </PrimaryButton>
            )}
            {passed && !isCompleted && (
              <PrimaryButton
                onClick={onComplete}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Quiz voltooien
              </PrimaryButton>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show question
  const vraag = vragen[currentQuestion];
  const opties = [vraag.optie_a, vraag.optie_b, vraag.optie_c, vraag.optie_d].filter(Boolean);

  return (
    <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Vraag {currentQuestion + 1} van {vragen.length}</span>
            <span className="font-medium text-coral-600 dark:text-coral-400">
              {Object.keys(answers).length} beantwoord
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-coral-500 to-coral-600 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / vragen.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{vraag.vraag}</h4>

          {/* Options */}
          <div className="space-y-3">
            {opties.map((optie: string, index: number) => {
              const isSelected = answers[currentQuestion] === optie;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(optie)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/30 shadow-md'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-coral-300 hover:bg-coral-50 dark:hover:bg-coral-900/20'
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">{optie}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <PrimaryButton
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              variant="outline"
              className="flex-1"
            >
              Vorige vraag
            </PrimaryButton>
          )}
          {currentQuestion < vragen.length - 1 && answers[currentQuestion] && (
            <PrimaryButton
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex-1 bg-coral-500 hover:bg-coral-600 text-white"
            >
              Volgende vraag
            </PrimaryButton>
          )}
          {allAnswered && (
            <PrimaryButton
              onClick={handleShowResults}
              className="flex-1 bg-coral-500 hover:bg-coral-600 text-white"
            >
              Bekijk resultaten
            </PrimaryButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
