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

export default function PreQuizTrueFalse() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

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

  // Save score to localStorage when quiz is completed
  useEffect(() => {
    if (quizCompleted) {
      try {
        localStorage.setItem('red_flags_pre_quiz_score', score.toString());
      } catch (e) {
        console.error('Could not save pre-quiz score', e);
      }
    }
  }, [quizCompleted, score]);

  if (quizCompleted) {
    const percentage = (score / QUESTIONS.length) * 100;
    const getMessage = () => {
      if (percentage === 100) {
        return '🎉 Perfect! Je bent al goed alert op rode vlaggen. Na Les 2 weet je nog meer!';
      } else if (percentage >= 60) {
        return '💪 Goed bezig! Je hebt al wat bewustzijn. Les 2 gaat je nog meer waardevolle inzichten geven.';
      } else {
        return '🌱 Geen zorgen! Les 2 is er juist om je te helpen deze rode vlaggen te herkennen. Je bent op de goede weg!';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Quiz Voltooid! 🎯</h3>
          <div className="mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {score}/{QUESTIONS.length}
            </div>
            <p className="text-gray-600">Jouw huidige bewustzijn over rode vlaggen</p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p className="text-gray-700">{getMessage()}</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
            <p className="font-semibold text-blue-900 mb-2">📊 Waarom deze pre-quiz?</p>
            <p className="text-blue-800 text-sm">
              We bewaren je score zodat je na Les 2 kunt zien hoeveel je hebt geleerd.
              Je krijgt dan dezelfde vragen nogmaals — en we laten je zien hoeveel je vooruitgang hebt geboekt!
            </p>
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
            {currentQuestionIndex < QUESTIONS.length - 1 ? 'Volgende Vraag →' : 'Bekijk Resultaat'}
          </button>
        </>
      )}

      {/* Info box */}
      {!showFeedback && (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 text-sm text-gray-700">
          <p className="font-semibold mb-1">💡 Tip:</p>
          <p>Kies het antwoord dat volgens jou het meest klopt. Er is geen verkeerd antwoord — het gaat om jouw huidige bewustzijn!</p>
        </div>
      )}
    </div>
  );
}
