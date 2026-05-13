'use client';

import { motion } from 'framer-motion';
import { Lock, ArrowRight, Shield } from 'lucide-react';
import type { Scores } from './types';

const PROFILES = {
  heler:   { emoji: '🌱', kleur: 'text-rose-700',   bg: 'bg-rose-50',   border: 'border-rose-200',   bar: 'bg-rose-400'    },
  waker:   { emoji: '🌤️', kleur: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  bar: 'bg-amber-400'   },
  starter: { emoji: '🚀', kleur: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   bar: 'bg-blue-400'    },
  bloeier: { emoji: '🌸', kleur: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  bar: 'bg-green-400'   },
};

const PROFIEL_NAMEN: Record<string, string> = {
  heler: 'De Heler', waker: 'De Waker', starter: 'De Starter', bloeier: 'De Bloeier',
};

const PROFIEL_SUBTITEL: Record<string, string> = {
  heler:   'Jouw hart is nog aan het helen — dat vraagt moed en tijd.',
  waker:   'Je wordt wakker na de scheiding — klaar voor voorzichtige stappen.',
  starter: 'Je staat klaar voor een nieuwe start — met bewustzijn en kracht.',
  bloeier: 'Je staat in volle bloei — het beste moment voor nieuwe ontmoetingen.',
};

const LOCKED_SECTIONS = [
  { title: 'Jouw volledige Herstart Analyse',  hint: 'Persoonlijk inzicht in wat jou tegenhoud en wat jou kracht geeft' },
  { title: 'Jouw 3-fase Actieplan',             hint: 'Concrete stappen voor week 1, maand 1 en maand 3' },
  { title: 'Rebound Risico Indicator',           hint: 'Hoe groot is jouw kans op een ongezonde rebound-relatie?' },
];

interface Props {
  scores: Scores;
  onUnlock: () => void;
}

export function ScheidingHerstartPreview({ scores, onUnlock }: Props) {
  const p = PROFILES[scores.profiel];
  const naam = PROFIEL_NAMEN[scores.profiel];

  const dimensions = [
    { label: 'Emotionele verwerking', value: scores.emotioneleVerwerking },
    { label: 'Identiteitskracht',     value: scores.identiteitskracht },
    { label: 'Dating mindset',        value: scores.datingMindset },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Profile reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">Jouw profiel</p>
          <div className="text-5xl mb-2">{p.emoji}</div>
          <h1 className={`text-4xl sm:text-5xl font-bold mb-3 ${p.kleur}`}>{naam}</h1>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${p.bg} ${p.border} border ${p.kleur}`}>
            Herstartscore: {scores.overallScore}/100
          </div>
          <p className="text-gray-600 mt-4 leading-relaxed max-w-md mx-auto">
            {PROFIEL_SUBTITEL[scores.profiel]}
          </p>
        </motion.div>

        {/* Score bars — teaser only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`${p.bg} ${p.border} border rounded-2xl p-5`}
        >
          <p className="text-sm font-semibold text-gray-600 mb-4">Jouw scores op hoofdgebieden</p>
          <div className="space-y-3">
            {dimensions.map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-bold ${p.kleur}`}>{value}%</span>
                </div>
                <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${p.bar} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Locked sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Ontgrendeld na gratis aanmelding
          </p>
          {LOCKED_SECTIONS.map((section, i) => (
            <div
              key={i}
              className="relative border border-gray-200 rounded-xl p-4 overflow-hidden bg-gray-50"
            >
              <div className="blur-sm select-none pointer-events-none">
                <p className="font-bold text-gray-900 text-sm mb-1">{section.title}</p>
                <p className="text-gray-500 text-sm">{section.hint}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-white/90 border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Gratis ontgrendelen</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="text-center pb-6"
        >
          <button
            onClick={onUnlock}
            className="w-full px-6 py-4 bg-rose-500 text-white rounded-full font-semibold text-lg hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
          >
            Ontgrendel Mijn Volledige Analyse
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3" />
            Gratis · Geen creditcard · Je gegevens worden nooit gedeeld
          </p>
        </motion.div>

      </div>
    </div>
  );
}
