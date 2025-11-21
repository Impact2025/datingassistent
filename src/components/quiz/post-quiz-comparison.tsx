'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: string;
  statement: string;
  correctAnswer: boolean;
  feedback: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    statement: 'Overmatig snel "ik hou van je" zeggen kan een rode vlag zijn.',
    correctAnswer: true,
    feedback: 'Dit is een vorm van Love Bombing – een manipulatietechniek waarbij iemand je overspoelt met aandacht en emotie, om je snel emotioneel afhankelijk te maken. Gezonde connectie groeit geleidelijk.'
  },
  {
    id: 'q2',
    statement: 'Het is veilig als iemand nooit over zichzelf praat.',
    correctAnswer: false,
    feedback: 'Dit is juist een rode vlag! Iemand die vaag blijft over zichzelf, kan iets verbergen (zoals een relatie, valse identiteit, of andere intenties). Oprechte interesse gaat twee kanten op.'
  },
  {
    id: 'q3',
    statement: 'Je hoeft je gevoel van ongemak niet te verklaren.',
    correctAnswer: true,
    feedback: 'Als iets niet goed voelt, is dat genoeg reden om te stoppen of afstand te nemen. Je hoeft niemand overtuigen of jezelf rechtvaardigen. Jouw veiligheid > iemand anders gevoelens.'
  },
  {
    id: 'q4',
    statement: 'Een profielfoto zonder gezicht is geen probleem.',
    correctAnswer: false,
    feedback: 'Vage profielfoto\'s, of foto\'s die niet kloppen met de rest van iemands verhaal, kunnen wijzen op catfishing of dat iemand iets verbergt (bijvoorbeeld een relatie). Transparantie is de basis van vertrouwen.'
  },
  {
    id: 'q5',
    statement: 'Jij mag altijd stoppen met een gesprek.',
    correctAnswer: true,
    feedback: 'Je bent nooit verplicht om een gesprek voort te zetten. Als iemand jouw grenzen niet respecteert, of je voelt je niet op je gemak — jij bepaalt wanneer je stopt. Blokken en rapporteren is jouw recht.'
  }
];

export default function PostQuizComparison() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [preQuizScore, setPreQuizScore] = useState<number | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  // Load pre-quiz score from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('red_flags_pre_quiz_score');
      if (stored) {
        setPreQuizScore(parseInt(stored));
      }
    } catch (e) {
      console.error('Could not load pre-quiz score', e);
    }
  }, []);

  // Save post-quiz score when completed
  useEffect(() => {
    if (quizCompleted) {
      try {
        localStorage.setItem('red_flags_post_quiz_score', score.toString());
      } catch (e) {
        console.error('Could not save post-quiz score', e);
      }
    }
  }, [quizCompleted, score]);

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);

    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = (score / QUESTIONS.length) * 100;
    const improvement = preQuizScore !== null ? score - preQuizScore : null;

    const getMessage = () => {
      if (percentage === 100) {
        return '🎉 Perfect! Je herkent nu alle rode vlaggen met zekerheid!';
      } else if (percentage >= 60) {
        return '💪 Goed gedaan! Je bewustzijn over rode vlaggen is duidelijk gegroeid!';
      } else {
        return '📚 Je hebt de belangrijkste punten geleerd. Herlees de 5 V\'s nog eens!';
      }
    };

    const getImprovementMessage = () => {
      if (improvement === null) {
        return null;
      }
      if (improvement > 0) {
        return `📈 Fantastisch! Je scoorde ${improvement} ${improvement === 1 ? 'punt' : 'punten'} hoger dan bij de pre-quiz!`;
      } else if (improvement === 0) {
        return '✨ Je score is gelijk gebleven. Je had al een goed bewustzijn!';
      } else {
        return '💡 Je score is iets lager, maar dat is oké! Het gaat om de kennis die je hebt opgedaan.';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Post-Quiz Voltooid! 🎯</h3>

          {/* Current Score */}
          <div className="mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {score}/{QUESTIONS.length}
            </div>
            <p className="text-gray-600">Jouw score na Les 2</p>
          </div>

          {/* Comparison with Pre-Quiz */}
          {preQuizScore !== null && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 mb-6">
              <div className="flex justify-around items-center mb-3">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Pre-Quiz</div>
                  <div className="text-3xl font-bold text-gray-700">{preQuizScore}</div>
                </div>
                <div className="text-3xl text-purple-600">→</div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Post-Quiz</div>
                  <div className="text-3xl font-bold text-purple-600">{score}</div>
                </div>
              </div>
              <p className="font-semibold text-purple-900">{getImprovementMessage()}</p>
            </div>
          )}

          {/* Message */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p className="text-gray-700">{getMessage()}</p>
          </div>

          {/* Growth Message */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-left">
            <p className="font-semibold text-green-900 mb-2">🌱 Wat je hebt geleerd:</p>
            <ul className="text-green-800 text-sm space-y-1">
              <li>✓ De 5 V's: Vage foto's, Vlotte praat, Verhalen vol drama, Verdoezelde antwoorden, Verliefdheidsbombardement</li>
              <li>✓ De Bonus V6: Verleggen van grenzen (dealbreaker!)</li>
              <li>✓ Jouw veiligheid komt altijd eerst</li>
              <li>✓ Je intuïtie is je beste bescherming</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
            <p className="font-semibold text-blue-900 mb-2">📱 Volgende stappen:</p>
            <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
              <li>Download je werkboek met de 5 V's checklist</li>
              <li>Gebruik de screenshot-analyzer voor je eigen chats</li>
              <li>Deel je inzichten in het forum</li>
              <li>Bij V6 (grenzen verleggen): STOP, screenshot, blokkeer, rapporteer</li>
            </ol>
          </div>

          <button
            onClick={handleRetake}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Probeer Opnieuw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Vraag {currentQuestionIndex + 1} van {QUESTIONS.length}
          </span>
          <span className="text-sm font-medium text-purple-600">
            Score: {score}/{QUESTIONS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {currentQuestion.statement}
        </h3>
      </div>

      {/* Answer buttons */}
      {!showFeedback ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleAnswer(true)}
            className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-4 px-6 rounded-lg transition border-2 border-green-300"
          >
            ✓ Juist
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-4 px-6 rounded-lg transition border-2 border-red-300"
          >
            ✗ Onjuist
          </button>
        </div>
      ) : (
        <>
          {/* Feedback */}
          <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
            <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
              {isCorrect ? '✅ Correct!' : '❌ Helaas, dat klopt niet helemaal.'}
            </p>
            <p className={isCorrect ? 'text-green-800' : 'text-red-800'}>
              {currentQuestion.feedback}
            </p>
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition"
          >
            {currentQuestionIndex < QUESTIONS.length - 1 ? 'Volgende Vraag →' : 'Bekijk Resultaat & Vergelijking'}
          </button>
        </>
      )}

      {/* Info box */}
      {!showFeedback && (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 text-sm text-gray-700">
          <p className="font-semibold mb-1">💡 Let op:</p>
          <p>Dit zijn dezelfde vragen als de pre-quiz. We vergelijken je antwoorden om te zien hoeveel je hebt geleerd!</p>
        </div>
      )}
    </div>
  );
}
