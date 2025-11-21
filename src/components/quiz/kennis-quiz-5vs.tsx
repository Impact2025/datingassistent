'use client';

import { useState } from 'react';

interface Question {
  id: string;
  question: string;
  scenario?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  feedback: {
    correct: string;
    incorrect: string;
  };
  relatedV: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'Je matcht met iemand die een prachtig profiel heeft, maar bij het video-bellen zie je dat de persoon er heel anders uitziet. Welke rode vlag is dit?',
    options: {
      A: 'V2 – Vlotte oppervlakkige praat',
      B: 'V1 – Vage foto\'s/info',
      C: 'V4 – Verdoezelde antwoorden',
      D: 'V3 – Verhalen vol drama'
    },
    correctAnswer: 'B',
    feedback: {
      correct: 'Correct! Dit is V1 – Vage foto\'s/info. Misleidende foto\'s zijn een klassieke vorm van catfishing. Transparantie over je uiterlijk is de basis van eerlijke dating.',
      incorrect: 'Dit is V1 – Vage foto\'s/info. Wanneer iemands foto\'s niet overeenkomen met de werkelijkheid, kan dit wijzen op catfishing of het verbergen van hun identiteit.'
    },
    relatedV: 'V1 – Vage foto\'s/info'
  },
  {
    id: 'q2',
    scenario: 'Na 3 dagen chatten schrijft je match: "Ik heb nog nooit zoiets gevoeld. Jij bent echt de persoon waar ik mijn hele leven naar heb gezocht. Ik wil de rest van mijn leven met jou doorbrengen!"',
    question: 'Welke rode vlag herken je hier?',
    options: {
      A: 'V4 – Verdoezelde antwoorden',
      B: 'V2 – Vlotte oppervlakkige praat',
      C: 'V5 – Verliefdheidsbombardement (Love Bombing)',
      D: 'V3 – Verhalen vol drama'
    },
    correctAnswer: 'C',
    feedback: {
      correct: 'Helemaal goed! Dit is V5 – Verliefdheidsbombardement. Dit is een manipulatietechniek waarbij iemand je overspoelt met extreme emotie en aandacht om je snel emotioneel afhankelijk te maken. Gezonde liefde groeit geleidelijk.',
      incorrect: 'Dit is V5 – Verliefdheidsbombardement (Love Bombing). Te veel, te snel, te intens. Dit soort overdreven emotionele uitspraken na slechts een paar dagen zijn een klassiek waarschuwingssignaal voor manipulatie.'
    },
    relatedV: 'V5 – Verliefdheidsbombardement'
  },
  {
    id: 'q3',
    scenario: 'Je vraagt: "Wat doe je voor werk?" Match antwoordt: "Oh, van alles een beetje. Maar vertel eens over jou!" Je vraagt later waar hij/zij woont, antwoord: "In de buurt. Heb je al weekend plannen?"',
    question: 'Welke V zie je hier in actie?',
    options: {
      A: 'V1 – Vage foto\'s/info',
      B: 'V4 – Verdoezelde antwoorden',
      C: 'V2 – Vlotte oppervlakkige praat',
      D: 'V5 – Verliefdheidsbombardement'
    },
    correctAnswer: 'B',
    feedback: {
      correct: 'Correct! Dit is V4 – Verdoezelde antwoorden. De persoon is systematisch ontwijkend over basisinformatie en draait steeds het gesprek om. Dit kan betekenen dat ze iets verbergen (een relatie, valse identiteit, etc.).',
      incorrect: 'Dit is V4 – Verdoezelde antwoorden. Let op patronen waarbij iemand consequent vage of ontwijkende antwoorden geeft op simpele vragen. Oprechte interesse betekent transparantie over de basis.'
    },
    relatedV: 'V4 – Verdoezelde antwoorden'
  },
  {
    id: 'q4',
    scenario: 'Je match vertelt: "Mijn ex was echt gestoord, heeft al mijn vrienden tegen me opgezet. En mijn baas is ook een idioot, heeft me onterecht ontslagen. En mijn huisbaas probeert me eruit te krijgen zonder reden..."',
    question: 'Welke rode vlag identificeer je in dit verhaal?',
    options: {
      A: 'V3 – Verhalen vol drama',
      B: 'V2 – Vlotte oppervlakkige praat',
      C: 'V5 – Verliefdheidsbombardement',
      D: 'V6 – Verleggen van grenzen'
    },
    correctAnswer: 'A',
    feedback: {
      correct: 'Helemaal juist! Dit is V3 – Verhalen vol drama. Wanneer iemand zich altijd presenteert als slachtoffer en iedereen om hen heen "het probleem" is, is dat een rode vlag. Het kan wijzen op een gebrek aan zelfreflectie of manipulatief gedrag.',
      incorrect: 'Dit is V3 – Verhalen vol drama. Als iemand constant negatief is en altijd het slachtoffer lijkt te zijn van "alle anderen", kan dit wijzen op toxisch gedrag. Gezonde mensen nemen ook verantwoordelijkheid voor hun eigen rol in conflicten.'
    },
    relatedV: 'V3 – Verhalen vol drama'
  },
  {
    id: 'q5',
    scenario: 'Je hebt aangegeven dat je het rustig aan wilt doen met daten. Je match blijft pushen: "Kom op, als je echt om me geeft zou je wel langskomen. Een video-call is niet genoeg. Waarom vertrouw je me niet?"',
    question: 'Welke rode vlag is dit, en hoe ernstig is deze?',
    options: {
      A: 'V2 – Vlotte oppervlakkige praat (mild)',
      B: 'V5 – Verliefdheidsbombardement (serieus)',
      C: 'V6 – Verleggen van grenzen (DEALBREAKER)',
      D: 'V4 – Verdoezelde antwoorden (mild)'
    },
    correctAnswer: 'C',
    feedback: {
      correct: 'Absoluut correct! Dit is V6 – Verleggen van grenzen, en dit is een DEALBREAKER. Wanneer iemand jouw "nee" niet respecteert en druk uitoefent of schuldgevoelens aanpraat, is dat een ernstige rode vlag. Bij V6: STOP, screenshot, blokkeer, rapporteer.',
      incorrect: 'Dit is V6 – Verleggen van grenzen – de MEEST SERIEUZE rode vlag! Wanneer iemand je grenzen niet respecteert en manipulatie gebruikt ("als je echt om me geeft..."), is dat een DEALBREAKER. Je moet ONMIDDELLIJK stoppen met het gesprek.'
    },
    relatedV: 'V6 – Verleggen van grenzen (DEALBREAKER!)'
  }
];

export default function KennisQuiz5Vs() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
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
    const getMessage = () => {
      if (percentage === 100) {
        return '🎉 Perfect! Je beheerst de 5 V\'s volledig. Je bent goed voorbereid om rode vlaggen te herkennen!';
      } else if (percentage >= 80) {
        return '💪 Uitstekend! Je hebt de meeste V\'s onder de knie. Bekijk de feedback nog eens voor extra zekerheid.';
      } else if (percentage >= 60) {
        return '📚 Goed bezig! Je herkent al veel rode vlaggen. Herlees de video uitleg voor de vragen die je miste.';
      } else {
        return '🔄 Bekijk de 5 V\'s video nog eens en probeer daarna opnieuw. De herkenning komt met oefening!';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Kennisquiz Voltooid! 🎯</h3>

          {/* Score */}
          <div className="mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {score}/{QUESTIONS.length}
            </div>
            <p className="text-gray-600">Jouw score op de 5 V's</p>
          </div>

          {/* Message */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p className="text-gray-700">{getMessage()}</p>
          </div>

          {/* The 5 V's Summary */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
            <p className="font-semibold text-blue-900 mb-3">🎯 De 5 V's Samenvatting:</p>
            <div className="text-blue-800 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[24px]">V1</span>
                <span>🔍 Vage foto's/info – Onduidelijke identiteit</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[24px]">V2</span>
                <span>💬 Vlotte oppervlakkige praat – Charmant zonder diepgang</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[24px]">V3</span>
                <span>⛈️ Verhalen vol drama – Altijd het slachtoffer</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[24px]">V4</span>
                <span>❓ Verdoezelde antwoorden – Ontwijkend over basisinfo</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[24px]">V5</span>
                <span>❤️‍🔥 Verliefdheidsbombardement – Te snel, te intens</span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t-2 border-red-300">
                <span className="font-bold min-w-[24px] text-red-600">V6</span>
                <span className="text-red-700 font-semibold">🚨 Verleggen van grenzen – DEALBREAKER!</span>
              </div>
            </div>
          </div>

          {/* Action Reminder */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
            <p className="font-semibold text-red-900 mb-2">🚨 Onthoud bij V6:</p>
            <ol className="text-red-800 text-sm space-y-1 list-decimal list-inside">
              <li>STOP het gesprek onmiddellijk</li>
              <li>Screenshot het gesprek (bewijs)</li>
              <li>Blokkeer de persoon</li>
              <li>Rapporteer aan de dating-app</li>
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

      {/* Scenario (if present) */}
      {currentQuestion.scenario && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm font-semibold text-blue-900 mb-2">📱 Scenario:</p>
          <p className="text-blue-800 text-sm italic">"{currentQuestion.scenario}"</p>
        </div>
      )}

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Answer options */}
      {!showFeedback ? (
        <div className="space-y-3 mb-6">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleAnswer(key as 'A' | 'B' | 'C' | 'D')}
              className="w-full text-left bg-gray-50 hover:bg-purple-50 border-2 border-gray-300 hover:border-purple-400 rounded-lg p-4 transition"
            >
              <span className="font-bold text-purple-600">{key}.</span> {value}
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Selected answer display */}
          <div className="space-y-3 mb-6">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = key === selectedAnswer;
              const isCorrectOption = key === currentQuestion.correctAnswer;

              let bgColor = 'bg-gray-50 border-gray-300';
              if (isSelected && isCorrect) {
                bgColor = 'bg-green-100 border-green-500';
              } else if (isSelected && !isCorrect) {
                bgColor = 'bg-red-100 border-red-500';
              } else if (isCorrectOption && !isCorrect) {
                bgColor = 'bg-green-50 border-green-400';
              }

              return (
                <div
                  key={key}
                  className={`w-full text-left border-2 rounded-lg p-4 ${bgColor}`}
                >
                  <span className="font-bold">{key}.</span> {value}
                  {isSelected && isCorrect && <span className="ml-2 text-green-600">✓</span>}
                  {isSelected && !isCorrect && <span className="ml-2 text-red-600">✗</span>}
                  {isCorrectOption && !isCorrect && <span className="ml-2 text-green-600">← Correct</span>}
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
            <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
              {isCorrect ? '✅ Helemaal goed!' : '❌ Niet helemaal correct'}
            </p>
            <p className={`mb-3 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? currentQuestion.feedback.correct : currentQuestion.feedback.incorrect}
            </p>
            <div className="inline-block bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700 border border-purple-300">
              {currentQuestion.relatedV}
            </div>
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
          <p>Lees elk scenario goed en probeer te identificeren welke van de 5 V's (of V6!) je herkent.</p>
        </div>
      )}
    </div>
  );
}
