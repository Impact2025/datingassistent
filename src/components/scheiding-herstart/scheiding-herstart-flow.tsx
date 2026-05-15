'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, X, ArrowLeft, Heart, Clock, Shield } from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { ScheidingHerstartQuestionnaire } from './scheiding-herstart-questionnaire';
import { ScheidingHerstartResults } from './scheiding-herstart-results';
import { ScheidingHerstartPreview } from './scheiding-herstart-preview';
import { ScheidingHerstartLeadGate } from './scheiding-herstart-lead-gate';
import { ScheidingHerstartAnalyzing } from './scheiding-herstart-analyzing';
import type { IntakeData, ScanResult, Scores } from './types';

type FlowStep = 'intro' | 'intake' | 'questionnaire' | 'preview' | 'lead-gate' | 'analyzing' | 'results';

interface ScheidingHerstartFlowProps {
  onClose?: () => void;
}

export function ScheidingHerstartFlow({ onClose }: ScheidingHerstartFlowProps = {}) {
  const { user } = useUser();
  const [step, setStep] = useState<FlowStep>('intro');
  const [intake, setIntake] = useState<IntakeData>({
    tijdSindsScheiding: '',
    relatieduur: '',
    kinderen: '',
  });
  const [previewScores, setPreviewScores] = useState<Scores | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [firstName, setFirstName] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Parallel coordination: API call and analyzing animation run concurrently.
  // We only advance to results when BOTH are done.
  const apiResultRef = useRef<ScanResult | null>(null);
  const apiReadyRef = useRef(false);
  const analyzingDoneRef = useRef(false);

  const stepProgress: Record<FlowStep, number> = {
    intro: 0, intake: 15, questionnaire: 50,
    preview: 75, 'lead-gate': 80, analyzing: 90, results: 100,
  };

  const handleIntakeComplete = (data: IntakeData) => {
    setIntake(data);
    setStep('questionnaire');
  };

  const handleQuestionnaireComplete = (answers: Record<string, number>) => {
    const scores = calculateFallbackScores(answers, intake);
    setPreviewScores(scores);
    // Store answers for later API call triggered after lead gate
    answersRef.current = answers;
    setStep('preview');
  };

  const answersRef = useRef<Record<string, number>>({});

  const handleLeadSubmit = async (email: string, name: string, acceptsMarketing: boolean) => {
    setFirstName(name);
    setIsSubmittingLead(true);
    apiReadyRef.current = false;
    analyzingDoneRef.current = false;
    apiResultRef.current = null;

    setStep('analyzing');
    setIsSubmittingLead(false);

    // Fire API call in the background
    fetch('/api/scheiding-herstart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: answersRef.current,
        intake,
        userId: user?.id,
        email,
        firstName: name,
        acceptsMarketing,
      }),
    })
      .then(r => r.json())
      .then(data => {
        const r: ScanResult = data.success
          ? data.result
          : { scores: calculateFallbackScores(answersRef.current, intake), aiAnalysis: null };
        apiResultRef.current = r;
        apiReadyRef.current = true;
        maybeAdvanceToResults();
      })
      .catch(() => {
        apiResultRef.current = {
          scores: calculateFallbackScores(answersRef.current, intake),
          aiAnalysis: null,
        };
        apiReadyRef.current = true;
        maybeAdvanceToResults();
      });
  };

  const maybeAdvanceToResults = useCallback(() => {
    if (apiReadyRef.current && analyzingDoneRef.current && apiResultRef.current) {
      setResult(apiResultRef.current);
      setStep('results');
    }
  }, []);

  const handleAnalyzingComplete = useCallback(() => {
    analyzingDoneRef.current = true;
    maybeAdvanceToResults();
  }, [maybeAdvanceToResults]);

  const showHeader = step !== 'preview' && step !== 'lead-gate' && step !== 'analyzing' && step !== 'results';

  return (
    <div className="space-y-6">
      {/* Header — hidden on full-screen steps */}
      {showHeader && (
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6 relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Sluiten"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="text-center">
              <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-rose-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Herstart na Scheiding</h1>
              <p className="text-gray-500 text-sm mb-5">
                {step === 'intro' && 'Ben jij klaar voor een nieuwe start?'}
                {step === 'intake' && 'Vertel ons iets over je situatie'}
                {step === 'questionnaire' && 'Beantwoord eerlijk voor het beste resultaat'}
              </p>
              <div className="max-w-md mx-auto">
                <Progress value={stepProgress[step]} className="h-1.5" />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>Start</span>
                  <span>Vragen</span>
                  <span>Resultaat</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {step === 'intro' && (
        <IntroScreen onStart={() => setStep('intake')} />
      )}

      {step === 'intake' && (
        <IntakeScreen
          intake={intake}
          onComplete={handleIntakeComplete}
          onBack={() => setStep('intro')}
        />
      )}

      {step === 'questionnaire' && (
        <ScheidingHerstartQuestionnaire
          intake={intake}
          onComplete={handleQuestionnaireComplete}
          onBack={() => setStep('intake')}
        />
      )}

      {step === 'preview' && previewScores && (
        <ScheidingHerstartPreview
          scores={previewScores}
          onUnlock={() => setStep('lead-gate')}
        />
      )}

      {step === 'lead-gate' && (
        <ScheidingHerstartLeadGate
          onSubmit={handleLeadSubmit}
          onBack={() => setStep('preview')}
          isSubmitting={isSubmittingLead}
        />
      )}

      {step === 'analyzing' && (
        <ScheidingHerstartAnalyzing
          firstName={firstName}
          profiel={previewScores?.profiel}
          onComplete={handleAnalyzingComplete}
        />
      )}

      {step === 'results' && result && (
        <ScheidingHerstartResults
          result={result}
          intake={intake}
          onRestart={() => {
            setStep('intro');
            setResult(null);
            setPreviewScores(null);
            apiReadyRef.current = false;
            analyzingDoneRef.current = false;
            apiResultRef.current = null;
          }}
          onClose={onClose}
        />
      )}

      {/* Footer — hidden on full-screen steps */}
      {showHeader && step !== 'results' && (
        <div className="text-center text-xs text-gray-400 pb-4">
          Gebaseerd op ons artikel:{' '}
          <a
            href="/blog/opnieuw-daten-na-een-scheiding-wanneer-ben-je-klaar-en-hoe-begin-je"
            className="underline hover:text-gray-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Opnieuw daten na een scheiding
          </a>
          {' · '}AVG-proof · Direct resultaat
        </div>
      )}
    </div>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-8 space-y-8">
        <div className="text-center">
          <p className="text-gray-700 leading-relaxed max-w-xl mx-auto">
            Een scheiding is een van de grootste keerpunten in je leven. Maar wanneer ben je echt
            klaar voor een nieuwe start? Deze scan geeft je eerlijk antwoord — op basis van
            wetenschap, niet gevoel.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {[
            { icon: Heart, label: 'Persoonlijk Profiel', desc: 'Heler, Waker, Starter of Bloeier' },
            { icon: Shield, label: 'Rebound Risico Check', desc: 'Laag, gemiddeld of hoog' },
            { icon: Sparkles, label: 'Actieplan op maat', desc: 'Week 1 · Maand 1 · Maand 3' },
            { icon: Clock, label: 'Direct resultaat', desc: '± 4 minuten · 12 vragen' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={onStart}
            size="lg"
            className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-6 text-base rounded-xl shadow-lg"
          >
            Start de Scan
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-gray-400 mt-3">
            Gratis · Geen account vereist · Resultaat ook per mail
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface IntakeScreenProps {
  intake: IntakeData;
  onComplete: (data: IntakeData) => void;
  onBack: () => void;
}

function IntakeScreen({ intake, onComplete, onBack }: IntakeScreenProps) {
  const [data, setData] = useState<IntakeData>(intake);

  const tijdOpties = [
    { value: 'less_3m', label: 'Minder dan 3 maanden' },
    { value: '3_6m', label: '3 tot 6 maanden' },
    { value: '6_12m', label: '6 tot 12 maanden' },
    { value: '1_2y', label: '1 tot 2 jaar' },
    { value: 'more_2y', label: 'Meer dan 2 jaar geleden' },
  ];

  const duurOpties = [
    { value: 'short', label: 'Minder dan 2 jaar' },
    { value: 'medium', label: '2 tot 7 jaar' },
    { value: 'long', label: 'Meer dan 7 jaar (of getrouwd geweest)' },
  ];

  const kinderenOpties = [
    { value: 'no', label: 'Nee' },
    { value: 'yes_young', label: 'Ja — jonge kinderen (< 12 jaar)' },
    { value: 'yes_teen', label: 'Ja — tieners of oudere kinderen' },
  ];

  const isComplete = data.tijdSindsScheiding && data.relatieduur && data.kinderen;

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-8 space-y-8">
        <p className="text-sm text-gray-500 text-center">
          Deze context beïnvloedt je resultaat — maar niet je score. Wees eerlijk.
        </p>

        <div className="space-y-3">
          <label className="font-semibold text-gray-900">
            Hoe lang is je scheiding / het einde van de relatie geleden?
          </label>
          <div className="grid gap-2">
            {tijdOpties.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setData((d) => ({ ...d, tijdSindsScheiding: opt.value }))}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                  data.tijdSindsScheiding === opt.value
                    ? 'border-rose-400 bg-rose-50 text-rose-800 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-semibold text-gray-900">
            Hoe lang duurde de relatie of het huwelijk?
          </label>
          <div className="grid gap-2">
            {duurOpties.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setData((d) => ({ ...d, relatieduur: opt.value }))}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                  data.relatieduur === opt.value
                    ? 'border-rose-400 bg-rose-50 text-rose-800 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-semibold text-gray-900">
            Zijn er kinderen bij betrokken?
          </label>
          <div className="grid gap-2">
            {kinderenOpties.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setData((d) => ({ ...d, kinderen: opt.value }))}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                  data.kinderen === opt.value
                    ? 'border-rose-400 bg-rose-50 text-rose-800 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Terug
          </Button>
          <Button
            onClick={() => onComplete(data)}
            disabled={!isComplete}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
          >
            Start de vragen →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateFallbackScores(answers: Record<string, number>, intake: IntakeData): Scores {
  const p = (score: number, max: number) => Math.round((score / max) * 100);

  const q1 = answers.ex_gevoelens ?? 2;
  const q2raw = answers.dagelijkse_gedachten ?? 3;
  const q2 = 6 - q2raw;
  const q3 = answers.vrede_einde ?? 2;
  const q4 = answers.eigen_identiteit ?? 2;
  const q5 = answers.activiteiten_jezelf ?? 2;
  const q6 = answers.goed_in_vel ?? 2;
  const q7 = answers.reden_daten ?? 2;
  const q8 = answers.ex_scenario ?? 2;
  const q9 = answers.stabiel_leven ?? 2;
  const q10 = answers.scheiding_disclosure ?? 2;
  const q11 = answers.eerlijk_over_scheiding ?? 2;
  const q12 = answers.omgeving_klaar ?? 2;

  const emotioneleVerwerking = Math.round((p(q1, 4) + p(q2, 5) + p(q3, 5)) / 3);
  const identiteitskracht = Math.round((p(q4, 5) + p(q5, 5) + p(q6, 5)) / 3);
  const datingMindset = Math.round((p(q7, 4) + p(q10, 4) + p(q11, 5)) / 3);
  const praktischeStabiliteit = Math.round((p(q9, 5) + p(q8, 4)) / 2);
  const externeBevestiging = p(q12, 5);

  const overallScore = Math.round(
    emotioneleVerwerking * 0.30 +
    identiteitskracht * 0.25 +
    datingMindset * 0.25 +
    praktischeStabiliteit * 0.10 +
    externeBevestiging * 0.10
  );

  let reboundRisk = 0;
  if (intake.tijdSindsScheiding === 'less_3m') reboundRisk += 35;
  else if (intake.tijdSindsScheiding === '3_6m') reboundRisk += 20;
  else if (intake.tijdSindsScheiding === '6_12m') reboundRisk += 10;
  if (q7 === 1) reboundRisk += 25;
  else if (q7 === 2) reboundRisk += 20;
  if (q2 <= 2) reboundRisk += 15;
  if (q3 <= 2) reboundRisk += 10;
  reboundRisk = Math.min(100, reboundRisk);

  const profiel = overallScore >= 80 ? 'bloeier'
    : overallScore >= 60 ? 'starter'
    : overallScore >= 40 ? 'waker'
    : 'heler';

  return {
    overallScore,
    profiel: profiel as Scores['profiel'],
    emotioneleVerwerking,
    identiteitskracht,
    datingMindset,
    praktischeStabiliteit,
    externeBevestiging,
    reboundRisk,
    reboundNiveau: (reboundRisk < 30 ? 'laag' : reboundRisk < 60 ? 'gemiddeld' : 'hoog') as 'laag' | 'gemiddeld' | 'hoog',
  };
}
