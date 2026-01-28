'use client';

/**
 * AI Analysis Loader Component
 *
 * Beautiful loading animation while Iris analyzes Dating Snapshot results.
 * Shows progress through different analysis phases.
 */

import { motion } from 'framer-motion';
import { Brain, Sparkles, Heart, Target, Zap, CheckCircle } from 'lucide-react';
import { IrisAvatar } from '@/components/onboarding/IrisAvatar';
import type { AnalysisPhase } from '@/lib/ai/snapshot-analysis-types';

interface AIAnalysisLoaderProps {
  progress: number;
  currentPhase: AnalysisPhase;
  userName?: string;
}

const phases = [
  { id: 'connecting', icon: Brain, text: 'Iris verbindt met je antwoorden...' },
  { id: 'analyzing', icon: Sparkles, text: 'Analyseren van je profiel patronen...' },
  { id: 'correlating', icon: Heart, text: 'Verbanden leggen tussen je antwoorden...' },
  { id: 'personalizing', icon: Target, text: 'Personaliseren van je inzichten...' },
  { id: 'complete', icon: Zap, text: 'Klaar!' },
] as const;

export function AIAnalysisLoader({ progress, currentPhase, userName }: AIAnalysisLoaderProps) {
  const currentPhaseIndex = phases.findIndex((p) => p.id === currentPhase);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 sm:p-8">
      {/* Iris Avatar with animated glow */}
      <motion.div
        animate={{
          scale: [1, 1.03, 1],
          boxShadow: [
            '0 0 20px rgba(236, 72, 153, 0.2)',
            '0 0 40px rgba(236, 72, 153, 0.4)',
            '0 0 20px rgba(236, 72, 153, 0.2)',
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-8 rounded-full"
      >
        <IrisAvatar size="xl" showGlow className="ring-4 ring-coral-100" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {userName ? `${userName}, ` : ''}Iris analyseert je Dating Snapshot
        </h2>
        <p className="text-gray-500">Even geduld - ik maak een gepersonaliseerde analyse...</p>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-coral-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-sm text-gray-400">{Math.round(progress)}% compleet</p>
          <p className="text-sm text-gray-400">
            {currentPhase === 'complete' ? 'Voltooid!' : 'Analyseren...'}
          </p>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="space-y-3 w-full max-w-md">
        {phases.map((phase, index) => {
          const isComplete = index < currentPhaseIndex;
          const isCurrent = index === currentPhaseIndex;
          const isPending = index > currentPhaseIndex;
          const Icon = phase.icon;

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isComplete
                  ? 'bg-green-50'
                  : isCurrent
                    ? 'bg-coral-50'
                    : 'bg-gray-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-coral-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  isComplete
                    ? 'text-green-700'
                    : isCurrent
                      ? 'text-coral-700'
                      : 'text-gray-400'
                }`}
              >
                {phase.text}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Fun fact while waiting */}
      {currentPhase !== 'complete' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-sm text-gray-400 text-center max-w-sm"
        >
          Wist je dat? De AI analyseert meer dan 40 datapunten om jouw unieke dating profiel te
          begrijpen.
        </motion.p>
      )}
    </div>
  );
}
