'use client';

/**
 * Pattern Quiz Preview - Curiosity Gap Component
 *
 * Shows BEFORE the email gate. Displays:
 * - Pattern name + scores (immediately)
 * - Opening + nuance sections (visible)
 * - 3 locked sections (blurred, with lock icon)
 * - CTA to unlock with email
 *
 * Psychology: User sees enough to confirm "this is accurate"
 * before we ask for their email. Earned friction.
 */

import { motion } from 'framer-motion';
import { Lock, ArrowRight, Shield } from 'lucide-react';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';
import { getPatternResult } from '@/lib/quiz/pattern/pattern-results';

interface PatternPreviewProps {
  pattern: AttachmentPattern;
  anxietyScore: number;
  avoidanceScore: number;
  confidence: number;
  onUnlock: () => void;
}

const PATTERN_STYLES: Record<AttachmentPattern, { bg: string; text: string; border: string; bar: string; badge: string }> = {
  secure:          { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', badge: 'bg-emerald-100' },
  anxious:         { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  bar: 'bg-orange-500',  badge: 'bg-orange-100' },
  avoidant:        { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    bar: 'bg-blue-500',    badge: 'bg-blue-100' },
  fearful_avoidant:{ bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  bar: 'bg-purple-500',  badge: 'bg-purple-100' },
};

export function PatternPreview({ pattern, anxietyScore, avoidanceScore, confidence, onUnlock }: PatternPreviewProps) {
  const result = getPatternResult(pattern);
  const s = PATTERN_STYLES[pattern];

  const lockedSections = [
    { headline: result.patternExplained.headline, preview: result.patternExplained.paragraph },
    { headline: result.mainPitfall.headline,      preview: result.mainPitfall.paragraph },
    { headline: result.concreteTip.headline,      preview: result.concreteTip.tip },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Pattern reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">Jouw dating patroon</p>
          <h1 className={`text-4xl sm:text-5xl font-bold mb-2 ${s.text}`}>
            {result.title}
          </h1>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${s.badge} ${s.text}`}>
            {result.subtitle}
          </span>
        </motion.div>

        {/* Score bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${s.bg} ${s.border} border rounded-2xl p-5 mb-7`}
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Angst-score</span>
                <span className={`font-bold ${s.text}`}>{anxietyScore}%</span>
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${s.bar} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${anxietyScore}%` }}
                  transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Vermijding-score</span>
                <span className={`font-bold ${s.text}`}>{avoidanceScore}%</span>
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${s.bar} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${avoidanceScore}%` }}
                  transition={{ delay: 0.7, duration: 0.9, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Profielbetrouwbaarheid: {confidence}%
          </p>
        </motion.div>

        {/* Opening — fully visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-3">{result.opening.headline}</h2>
          <p className="text-gray-600 leading-relaxed">{result.opening.paragraph}</p>
        </motion.div>

        {/* Nuance — fully visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-7"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-3">{result.nuance.headline}</h2>
          <p className="text-gray-600 leading-relaxed">{result.nuance.paragraph}</p>
        </motion.div>

        {/* Locked sections — curiosity gap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3 mb-8"
        >
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Nog 3 secties ontgrendeld na gratis aanmelding
          </p>
          {lockedSections.map((section, i) => (
            <div
              key={i}
              className="relative border border-gray-200 rounded-xl p-4 overflow-hidden bg-gray-50"
            >
              {/* Blurred content underneath */}
              <div className="blur-sm select-none pointer-events-none">
                <h3 className="font-bold text-gray-900 text-base mb-1">{section.headline}</h3>
                <p className="text-gray-600 text-sm">{section.preview}</p>
              </div>
              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-white/90 border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                  <Lock className="w-4 h-4 text-gray-400" />
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
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <button
            onClick={onUnlock}
            className="w-full px-6 py-4 bg-coral-500 text-white rounded-full font-semibold text-lg hover:bg-coral-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-coral-500/20"
          >
            Ontgrendel Mijn Volledige Analyse
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Gratis · Geen creditcard · Je gegevens worden niet gedeeld
          </p>
        </motion.div>

      </div>
    </div>
  );
}
