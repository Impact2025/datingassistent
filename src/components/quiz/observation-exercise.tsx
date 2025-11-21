'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

interface Scenario {
  id: number;
  title: string;
  context: string;
  messages: Array<{
    sender: 'match' | 'you';
    text: string;
    time?: string;
  }>;
  correctFlags: string[];
  explanation: {
    [key: string]: string;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: 'Scenario 1: De Perfecte Match',
    context: 'Je matcht met Chris. Na 2 dagen chatten krijg je deze berichten:',
    messages: [
      { sender: 'match', text: 'Hé! Wat een match! 😍', time: '10:23' },
      { sender: 'you', text: 'Haha ja leuk! Hoe gaat het?', time: '10:25' },
      { sender: 'match', text: 'Goed! Maar echt... ik moet je iets zeggen. Ik voel zo\'n sterke connectie met jou. Dit heb ik nog nooit gehad.', time: '10:26' },
      { sender: 'you', text: 'Oh wow, dat is snel haha', time: '10:28' },
      { sender: 'match', text: 'Ik weet het, maar het voelt gewoon zo goed! Je bent echt speciaal. Ik denk dat jij de persoon bent waar ik mijn hele leven naar heb gezocht. 💕', time: '10:29' },
      { sender: 'match', text: 'Kunnen we niet gewoon vandaag al afspreken? Ik wil je zo graag zien!', time: '10:30' },
      { sender: 'you', text: 'Ik zou het rustiger aan willen doen...', time: '10:35' },
      { sender: 'match', text: 'Waarom? Als je echt om me geeft zou je wel willen afspreken. Vertrouw je me niet? 😢', time: '10:36' }
    ],
    correctFlags: ['V5', 'V6'],
    explanation: {
      'V1': 'Niet van toepassing. Er is geen sprake van vage foto\'s of onduidelijke informatie in dit scenario.',
      'V2': 'Niet direct van toepassing. Hoewel de praat vlot is, gaat het hier meer om intensiteit dan oppervlakkigheid.',
      'V3': 'Niet van toepassing. Er worden geen drama verhalen verteld over anderen.',
      'V4': 'Niet van toepassing. Er worden geen vragen ontwijkt.',
      'V5': '✅ CORRECT! Dit is klassiek Love Bombing: na slechts 2 dagen extreme emotionele uitspraken ("hele leven naar gezocht", "zo\'n sterke connectie"). Te veel, te snel, te intens.',
      'V6': '✅ CORRECT! Grenzen worden verlegd: "Als je echt om me geeft zou je wel willen afspreken." Dit is manipulatie om jouw grens (rustig aan doen) te negeren. DEALBREAKER!'
    }
  },
  {
    id: 2,
    title: 'Scenario 2: Mysterieus Profiel',
    context: 'Je hebt gematcht met Sam. Het profiel heeft één foto (van achteren), en jullie beginnen te chatten:',
    messages: [
      { sender: 'you', text: 'Hey! Leuke match. Vertel eens iets over jezelf?', time: '14:15' },
      { sender: 'match', text: 'Hoi! Ja leuk! Wat wil je weten?', time: '14:18' },
      { sender: 'you', text: 'Waar woon je? En wat doe je voor werk?', time: '14:20' },
      { sender: 'match', text: 'Oh, beetje overal eigenlijk haha. En werk... tja, van alles wat. Vertel jij eens over jezelf!', time: '14:22' },
      { sender: 'you', text: 'Ik woon in Amsterdam en werk in marketing. Maar vertel, wat doe je precies?', time: '14:25' },
      { sender: 'match', text: 'Gewoon... projecten en zo. Niet zo interessant. Zullen we het over leukere dingen hebben? Wat zijn je hobbies?', time: '14:27' },
      { sender: 'you', text: 'Haha oké. Maar mag ik je foto zien? Je hebt maar één foto en die is een beetje onduidelijk', time: '14:30' },
      { sender: 'match', text: 'Oh mijn camera is kapot momenteel. Maar we kunnen video-callen als je wilt! Morgen?', time: '14:32' },
      { sender: 'you', text: 'Prima! Morgen om 20:00?', time: '14:35' },
      { sender: 'match', text: '[De volgende dag] Hey sorry, mijn internet doet het niet. Kunnen we het uitstellen?', time: '19:45' }
    ],
    correctFlags: ['V1', 'V4'],
    explanation: {
      'V1': '✅ CORRECT! Vage foto\'s (één foto van achteren), geen duidelijke identiteit zichtbaar, en het ontwijken van een video-call op het laatste moment wijst op mogelijk catfishing.',
      'V2': 'Gedeeltelijk waar. Er is wel oppervlakkige praat, maar de kern van dit scenario is het vermijden van transparantie.',
      'V3': 'Niet van toepassing. Er worden geen drama verhalen verteld.',
      'V4': '✅ CORRECT! Systematisch verdoezelde antwoorden: "beetje overal", "van alles wat", "projecten en zo". Ontwijkt concrete vragen over woonplaats en werk. Draait gesprek steeds om naar jou.',
      'V5': 'Niet van toepassing. Er is geen sprake van love bombing of te snelle intensiteit.',
      'V6': 'Niet direct van toepassing. Hoewel het gedrag verdacht is, worden grenzen niet actief verlegd met manipulatie.'
    }
  },
  {
    id: 3,
    title: 'Scenario 3: Altijd Drama',
    context: 'Je bent al een week aan het chatten met Alex. Elke dag komen er nieuwe verhalen:',
    messages: [
      { sender: 'match', text: 'Ugh, wat een dag weer... 😤', time: '18:30' },
      { sender: 'you', text: 'Oh nee, wat is er gebeurd?', time: '18:32' },
      { sender: 'match', text: 'Mijn ex weer. Die blijft me stalken. Echt een psychopaat. Heeft al mijn vrienden tegen me opgezet.', time: '18:33' },
      { sender: 'you', text: 'Dat klinkt heftig...', time: '18:35' },
      { sender: 'match', text: 'Ja, en mijn baas is ook zo\'n idioot. Heeft me vandaag weer onterecht de schuld gegeven van iets wat een collega deed.', time: '18:36' },
      { sender: 'match', text: 'Niemand begrijpt me. Iedereen is altijd tegen mij. 😢', time: '18:38' },
      { sender: 'you', text: 'Hmm, dat is vervelend. Maar hoe zit het met je vrienden?', time: '18:40' },
      { sender: 'match', text: 'Heb geen echte vrienden meer. Mijn ex heeft ze allemaal tegen me opgezet. Ze geloven allemaal de leugens.', time: '18:42' },
      { sender: 'match', text: 'Maar genoeg over mij. Jij snapt me tenminste wel, toch? Jij bent anders dan de rest. ❤️', time: '18:45' }
    ],
    correctFlags: ['V3'],
    explanation: {
      'V1': 'Niet van toepassing. Er is geen sprake van vage foto\'s of onduidelijke identiteit.',
      'V2': 'Niet echt van toepassing. De praat is niet oppervlakkig, maar juist vol emotionele intensiteit.',
      'V3': '✅ CORRECT! Klassieke "Verhalen vol drama": Iedereen om hen heen is "het probleem" (psychopaat ex, idioot baas, valse vrienden). Altijd het slachtoffer, nooit eigen verantwoordelijkheid. Het patroon "iedereen is tegen mij" is een rode vlag.',
      'V4': 'Niet van toepassing. Er worden geen vragen ontwijkt, juist veel gedeeld (hoewel negatief).',
      'V5': 'Gedeeltelijk aanwezig in "Jij bent anders dan de rest", maar niet de hoofdvlag in dit scenario.',
      'V6': 'Niet direct van toepassing. Er worden geen grenzen actief verlegd.'
    }
  }
];

const V_OPTIONS = [
  { id: 'V1', label: 'V1 – Vage foto\'s/info', icon: '🔍' },
  { id: 'V2', label: 'V2 – Vlotte oppervlakkige praat', icon: '💬' },
  { id: 'V3', label: 'V3 – Verhalen vol drama', icon: '⛈️' },
  { id: 'V4', label: 'V4 – Verdoezelde antwoorden', icon: '❓' },
  { id: 'V5', label: 'V5 – Verliefdheidsbombardement', icon: '❤️‍🔥' },
  { id: 'V6', label: 'V6 – Verleggen van grenzen', icon: '🚨' }
];

export default function ObservationExercise() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const scenario = SCENARIOS[currentScenario];

  const toggleFlag = (flagId: string) => {
    if (showFeedback) return; // Can't change after submission

    setSelectedFlags(prev =>
      prev.includes(flagId)
        ? prev.filter(id => id !== flagId)
        : [...prev, flagId]
    );
  };

  const calculateScore = () => {
    const correct = scenario.correctFlags.filter(flag => selectedFlags.includes(flag)).length;
    const incorrect = selectedFlags.filter(flag => !scenario.correctFlags.includes(flag)).length;

    // Score: +3 points per correct, -1 per incorrect, max 6 points per scenario
    const score = Math.max(0, (correct * 3) - incorrect);
    return score;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setScores([...scores, score]);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedFlags([]);
      setShowFeedback(false);
    } else {
      setCompleted(true);
    }
  };

  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const maxScore = SCENARIOS.length * 6;

  if (completed) {
    const percentage = (totalScore / maxScore) * 100;
    const getMessage = () => {
      if (percentage >= 90) return '🎉 Excellent! Je hebt een scherp oog voor rode vlaggen!';
      if (percentage >= 70) return '💪 Goed gedaan! Je herkent de meeste patronen al goed.';
      if (percentage >= 50) return '📚 Niet slecht! Blijf oefenen om patronen sneller te herkennen.';
      return '🔄 Bekijk de scenario\'s nog eens. Focus op de subtiele signalen.';
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <div className="text-center">
          <Lucide.Award className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Observatie-oefening Voltooid! 🎯</h3>

          <div className="mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {totalScore}/{maxScore}
            </div>
            <p className="text-gray-600">punten behaald</p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p className="text-gray-700">{getMessage()}</p>
          </div>

          {/* Score breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Jouw scores per scenario:</h4>
            <div className="space-y-2">
              {SCENARIOS.map((s, idx) => (
                <div key={s.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{s.title}</span>
                  <span className="font-bold text-purple-600">{scores[idx]}/6</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key learnings */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
            <h4 className="font-semibold text-blue-900 mb-2">🎓 Key Learnings:</h4>
            <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
              <li>V5 en V6 zijn vaak samen aanwezig (manipulatie)</li>
              <li>V1 en V4 gaan vaak samen (iemand die iets verbergt)</li>
              <li>V3 wijst op gebrek aan zelfreflectie</li>
              <li>Meerdere V's tegelijk = verhoogd risico</li>
            </ul>
          </div>

          <button
            onClick={() => {
              setCurrentScenario(0);
              setSelectedFlags([]);
              setShowFeedback(false);
              setScores([]);
              setCompleted(false);
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            <Lucide.RotateCcw className="inline h-4 w-4 mr-2" />
            Probeer Opnieuw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Scenario {currentScenario + 1} van {SCENARIOS.length}
          </span>
          {scores.length > 0 && (
            <span className="text-sm font-medium text-purple-600">
              Score: {totalScore}/{scores.length * 6}
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentScenario + 1) / SCENARIOS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Scenario Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{scenario.title}</h3>
        <p className="text-gray-600 text-sm">{scenario.context}</p>
      </div>

      {/* Chat Messages */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {scenario.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender === 'you'
                    ? 'bg-purple-100 text-purple-900'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                {msg.time && (
                  <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <h4 className="font-bold text-gray-900 mb-2">
          Welke rode vlaggen zie je in dit scenario?
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Selecteer alle V's die van toepassing zijn. Er kunnen meerdere correct zijn!
        </p>
      </div>

      {/* V Options */}
      {!showFeedback ? (
        <div className="space-y-2 mb-6">
          {V_OPTIONS.map(v => (
            <button
              key={v.id}
              onClick={() => toggleFlag(v.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition ${
                selectedFlags.includes(v.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>
                  {v.icon} <span className="font-medium">{v.label}</span>
                </span>
                {selectedFlags.includes(v.id) && (
                  <Lucide.Check className="h-5 w-5 text-purple-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {V_OPTIONS.map(v => {
            const isSelected = selectedFlags.includes(v.id);
            const isCorrect = scenario.correctFlags.includes(v.id);
            const shouldBeSelected = isCorrect;

            let bgColor = 'bg-gray-50 border-gray-300';
            let textColor = 'text-gray-700';

            if (isSelected && isCorrect) {
              bgColor = 'bg-green-100 border-green-500';
              textColor = 'text-green-900';
            } else if (isSelected && !isCorrect) {
              bgColor = 'bg-red-100 border-red-500';
              textColor = 'text-red-900';
            } else if (!isSelected && isCorrect) {
              bgColor = 'bg-yellow-50 border-yellow-400';
              textColor = 'text-yellow-900';
            }

            return (
              <div key={v.id} className="space-y-2">
                <div className={`p-3 rounded-lg border-2 ${bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${textColor}`}>
                      {v.icon} {v.label}
                    </span>
                    {isSelected && isCorrect && <Lucide.CheckCircle className="h-5 w-5 text-green-600" />}
                    {isSelected && !isCorrect && <Lucide.XCircle className="h-5 w-5 text-red-600" />}
                    {!isSelected && isCorrect && <Lucide.AlertCircle className="h-5 w-5 text-yellow-600" />}
                  </div>
                  <p className={`text-sm ${textColor}`}>
                    {scenario.explanation[v.id]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      {!showFeedback ? (
        <button
          onClick={handleSubmit}
          disabled={selectedFlags.length === 0}
          className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Lucide.CheckCircle className="inline h-5 w-5 mr-2" />
          Controleer Antwoord
        </button>
      ) : (
        <div className="space-y-3">
          <div className={`p-4 rounded-lg ${
            calculateScore() >= 4 ? 'bg-green-50 border-l-4 border-green-500' : 'bg-orange-50 border-l-4 border-orange-500'
          }`}>
            <p className={`font-semibold ${
              calculateScore() >= 4 ? 'text-green-900' : 'text-orange-900'
            }`}>
              Score voor dit scenario: {calculateScore()}/6 punten
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition"
          >
            {currentScenario < SCENARIOS.length - 1 ? (
              <>
                Volgende Scenario <Lucide.ChevronRight className="inline h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                Bekijk Resultaat <Lucide.Award className="inline h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Tip */}
      {!showFeedback && (
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Tip:</p>
          <p>Lees het hele gesprek goed door en let op patronen. Soms zijn meerdere V's aanwezig!</p>
        </div>
      )}
    </div>
  );
}
