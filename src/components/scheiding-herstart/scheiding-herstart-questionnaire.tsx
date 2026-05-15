'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, ArrowRight, Heart, Brain, Sun, User,
  Sparkles, Target, MessageCircle, Home, Shield,
  MessageSquare, Users, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IntakeData } from './types';

interface Option {
  value: number;
  label: string;
  description?: string;
}

interface Question {
  id: string;
  category: string;
  categoryColor: string;
  type: 'radio' | 'likert' | 'scenario';
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  scenarioText?: string;
  options?: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 'ex_gevoelens',
    category: 'Emotionele verwerking',
    categoryColor: 'text-rose-600 bg-rose-50 border-rose-200',
    type: 'radio',
    icon: Heart,
    title: 'Als ik aan mijn ex denk, ervaar ik voornamelijk...',
    options: [
      { value: 1, label: 'Intense pijn, verdriet of woede', description: 'Het doet nog erg veel pijn' },
      { value: 2, label: 'Gemengde gevoelens', description: 'Soms goed, soms moeilijk' },
      { value: 3, label: 'Overwegend acceptatie', description: 'Ik begrijp hoe het zo is gegaan' },
      { value: 4, label: 'Rust en dankbaarheid', description: 'Voor wat het was — en vrede over het einde' },
    ],
  },
  {
    id: 'dagelijkse_gedachten',
    category: 'Emotionele verwerking',
    categoryColor: 'text-rose-600 bg-rose-50 border-rose-200',
    type: 'likert',
    icon: Brain,
    title: 'Ik denk meerdere keren per dag intensief aan mijn ex',
    subtitle: 'Denk aan dwangmatige of pijnlijke gedachten — wees eerlijk',
  },
  {
    id: 'vrede_einde',
    category: 'Emotionele verwerking',
    categoryColor: 'text-rose-600 bg-rose-50 border-rose-200',
    type: 'likert',
    icon: Sun,
    title: 'Ik heb vrede met het einde van de relatie',
    subtitle: 'Niet per se blij — maar ik accepteer het zoals het is',
  },
  {
    id: 'eigen_identiteit',
    category: 'Identiteit & eigenwaarde',
    categoryColor: 'text-purple-600 bg-purple-50 border-purple-200',
    type: 'likert',
    icon: User,
    title: 'Ik weet wie ik ben buiten de relatie',
    subtitle: 'Mijn eigen waarden, wensen en identiteit zijn mij duidelijk',
  },
  {
    id: 'activiteiten_jezelf',
    category: 'Identiteit & eigenwaarde',
    categoryColor: 'text-purple-600 bg-purple-50 border-purple-200',
    type: 'likert',
    icon: Sparkles,
    title: 'De afgelopen maanden heb ik regelmatig dingen gedaan puur voor mezelf',
    subtitle: 'Niet vanuit verplichting of als troost voor de eenzaamheid',
  },
  {
    id: 'goed_in_vel',
    category: 'Identiteit & eigenwaarde',
    categoryColor: 'text-purple-600 bg-purple-50 border-purple-200',
    type: 'likert',
    icon: Heart,
    title: 'Ik voel me goed in mijn vel',
    subtitle: 'Ongeacht of ik een partner heb of niet',
  },
  {
    id: 'reden_daten',
    category: 'Dating mindset',
    categoryColor: 'text-blue-600 bg-blue-50 border-blue-200',
    type: 'radio',
    icon: Target,
    title: 'Mijn voornaamste reden om te gaan daten is op dit moment...',
    options: [
      { value: 1, label: 'Ik voel me eenzaam', description: 'Ik mis het hebben van iemand naast me' },
      { value: 2, label: 'Ik wil aantonen dat ik verder kan', description: 'Aan mezelf — of aan mijn ex' },
      { value: 3, label: 'Ik wil nieuwe mensen leren kennen', description: 'Zonder druk op het resultaat' },
      { value: 4, label: 'Ik ben klaar voor een nieuw hoofdstuk', description: 'Ik voel het gewoon — nieuwsgierig en open' },
    ],
  },
  {
    id: 'ex_scenario',
    category: 'Praktische stabiliteit',
    categoryColor: 'text-green-600 bg-green-50 border-green-200',
    type: 'scenario',
    icon: MessageCircle,
    title: 'Scenario: hoe reageer jij?',
    scenarioText:
      'Je bent in een leuk gesprek met iemand op een dating-app. Op datzelfde moment stuurt je ex je een berichtje. Wat doe je?',
    options: [
      { value: 1, label: 'Ik zet het datinggesprek meteen op pauze', description: 'En lees het bericht van mijn ex' },
      { value: 2, label: 'Ik lees het snel', description: 'Maar kom moeilijk terug in het datinggesprek' },
      { value: 3, label: 'Ik sla het op voor later', description: 'En ga rustig verder met het datinggesprek' },
      { value: 4, label: 'Mijn stemming wordt er nauwelijks door beïnvloed', description: 'Ik ga gewoon door' },
    ],
  },
  {
    id: 'stabiel_leven',
    category: 'Praktische stabiliteit',
    categoryColor: 'text-green-600 bg-green-50 border-green-200',
    type: 'likert',
    icon: Home,
    title: 'Mijn dagelijks leven voelt stabiel',
    subtitle: 'Eigen routine, woonplek en basisstructuur op orde',
  },
  {
    id: 'scheiding_disclosure',
    category: 'Dating mindset',
    categoryColor: 'text-blue-600 bg-blue-50 border-blue-200',
    type: 'radio',
    icon: Shield,
    title: 'Als een date ontdekt dat ik gescheiden ben, voel ik...',
    options: [
      { value: 1, label: 'Schaamte of angst', description: 'Bang dat ze me anders gaan zien' },
      { value: 2, label: 'Enig ongemak', description: 'Maar ik weet dat het erbij hoort' },
      { value: 3, label: 'Niets bijzonders', description: 'Het is mijn verhaal en dat mag er zijn' },
      { value: 4, label: 'Totaal geen probleem', description: 'Het maakt me wie ik nu ben' },
    ],
  },
  {
    id: 'eerlijk_over_scheiding',
    category: 'Dating mindset',
    categoryColor: 'text-blue-600 bg-blue-50 border-blue-200',
    type: 'likert',
    icon: MessageSquare,
    title: 'Ik kan mij voorstellen eerlijk en open te zijn over mijn scheiding op een eerste date',
  },
  {
    id: 'omgeving_klaar',
    category: 'Externe bevestiging',
    categoryColor: 'text-amber-600 bg-amber-50 border-amber-200',
    type: 'likert',
    icon: Users,
    title: 'Mensen die me goed kennen, zeggen dat ik er klaar voor lijk om opnieuw te daten',
  },
];

const LIKERT_LABELS = [
  { value: 1, short: 'Helemaal niet' },
  { value: 2, short: 'Nauwelijks' },
  { value: 3, short: 'Soms' },
  { value: 4, short: 'Grotendeels' },
  { value: 5, short: 'Volledig' },
];

interface Props {
  intake: IntakeData;
  onComplete: (answers: Record<string, number>) => void;
  onBack: () => void;
}

export function ScheidingHerstartQuestionnaire({ onComplete, onBack }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const q = QUESTIONS[current];
  const Icon = q.icon;
  const progress = ((current + 1) / QUESTIONS.length) * 100;
  const answered = answers[q.id] !== undefined;

  const handleAnswer = (id: string, value: number) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    if ((q.type === 'radio' || q.type === 'scenario') && !isSubmitting) {
      setTimeout(() => {
        if (current < QUESTIONS.length - 1) {
          setCurrent((c) => c + 1);
        } else {
          setIsSubmitting(true);
          onComplete(updated);
        }
      }, 350);
    }
  };

  const handleNext = async () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setIsSubmitting(true);
      await onComplete(answers);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <span>Vraag {current + 1} van {QUESTIONS.length}</span>
        <Badge variant="outline" className={cn('text-xs border', q.categoryColor)}>
          {q.category}
        </Badge>
      </div>
      <Progress value={progress} className="h-1.5" />

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', q.categoryColor.split(' ').slice(1).join(' '))}>
                <Icon className={cn('w-5 h-5', q.categoryColor.split(' ')[0])} />
              </div>

              {/* Scenario box */}
              {q.type === 'scenario' && q.scenarioText && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-3 text-sm text-green-900 leading-relaxed">
                  <span className="font-semibold block mb-1">Stel je voor:</span>
                  {q.scenarioText}
                </div>
              )}

              <CardTitle className="text-lg leading-snug text-gray-900">
                {q.title}
              </CardTitle>
              {q.subtitle && (
                <p className="text-sm text-gray-500 mt-1">{q.subtitle}</p>
              )}
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Radio / Scenario options */}
              {(q.type === 'radio' || q.type === 'scenario') && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(q.id, opt.value)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl border-2 transition-all',
                        answers[q.id] === opt.value
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <span className={cn('block font-medium text-sm', answers[q.id] === opt.value ? 'text-rose-900' : 'text-gray-800')}>
                        {opt.label}
                      </span>
                      {opt.description && (
                        <span className={cn('block text-xs mt-0.5', answers[q.id] === opt.value ? 'text-rose-600' : 'text-gray-500')}>
                          {opt.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Likert scale */}
              {q.type === 'likert' && (
                <div className="space-y-2">
                  {LIKERT_LABELS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(q.id, opt.value)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all',
                        answers[q.id] === opt.value
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                        answers[q.id] === opt.value
                          ? 'bg-rose-400 text-white'
                          : 'bg-gray-100 text-gray-500'
                      )}>
                        {opt.value}
                      </div>
                      <span className={cn('text-sm font-medium', answers[q.id] === opt.value ? 'text-rose-900' : 'text-gray-700')}>
                        {opt.short}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={current === 0 ? onBack : () => setCurrent((c) => c - 1)}
                  className="flex items-center gap-1 text-gray-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {current === 0 ? 'Context' : 'Vorige'}
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!answered || isSubmitting}
                  className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyseren...
                    </>
                  ) : current === QUESTIONS.length - 1 ? (
                    <>Bekijk mijn resultaat <Sparkles className="w-4 h-4" /></>
                  ) : (
                    <>Volgende <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-300',
              i === current ? 'w-4 h-2 bg-rose-500' : i < current ? 'w-2 h-2 bg-green-400' : 'w-2 h-2 bg-gray-200'
            )}
          />
        ))}
      </div>
    </div>
  );
}
