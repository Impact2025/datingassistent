'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, Sparkles, Heart, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ScanStatus } from '@/hooks/use-scan-manager';

interface ScanStatusMap {
  hechtingsstijl?: ScanStatus;
  datingstijl?: ScanStatus;
  'emotionele-readiness'?: ScanStatus;
  [key: string]: ScanStatus | undefined;
}

interface JourneyNextStepCardProps {
  scanStatus: ScanStatusMap | null;
  onScanOpen: (scanType: string) => void;
  onTabChange?: (tab: string) => void;
}

const PHASE_1_STEPS = [
  {
    id: 'hechtingsstijl',
    label: 'Hechtingsstijl scan',
    tagline: 'De basis van hoe jij liefhebt · 5 min',
    icon: Heart,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: 'datingstijl',
    label: 'Dating stijl scan',
    tagline: 'Ontdek je patronen & blinde vlekken · 4 min',
    icon: Target,
    color: 'text-coral-500',
    bg: 'bg-coral-50 dark:bg-coral-900/20',
  },
  {
    id: 'emotionele-readiness',
    label: 'Emotionele readiness check',
    tagline: 'Ben je klaar om te daten? · 3 min',
    icon: Zap,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
];

export function JourneyNextStepCard({ scanStatus, onScanOpen, onTabChange }: JourneyNextStepCardProps) {
  const router = useRouter();

  const stepsDone = PHASE_1_STEPS.filter(
    (s) => scanStatus?.[s.id]?.isCompleted
  ).length;

  const allDone = stepsDone === PHASE_1_STEPS.length;
  const nextStep = PHASE_1_STEPS.find((s) => !scanStatus?.[s.id]?.isCompleted);

  // Phase 1 voltooid → upsell
  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-6 translate-x-6 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-white/80" />
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Fase 1 voltooid</p>
          </div>
          <p className="text-lg font-bold text-white mb-1">
            Jij kent jezelf. Klaar voor de volgende stap?
          </p>
          <p className="text-sm text-white/70 mb-4">
            Start Kickstart: 21 dagen, concrete resultaten.
          </p>
          <button
            onClick={() => router.push('/prijzen')}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          >
            Start Kickstart
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
              Jouw journey
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              Fase 1 · Fundament
            </p>
          </div>
          {/* Phase dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all',
                  i === 1
                    ? 'w-5 h-2 bg-coral-500'
                    : 'w-2 h-2 bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2.5">
          {PHASE_1_STEPS.map((step) => {
            const done = scanStatus?.[step.id]?.isCompleted ?? false;
            const isNext = step.id === nextStep?.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-3 transition-all',
                  isNext
                    ? 'bg-gray-50 dark:bg-gray-700/50 ring-1 ring-gray-200 dark:ring-gray-600'
                    : 'opacity-60'
                )}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', step.bg)}>
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <Icon className={cn('w-4 h-4', step.color)} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold leading-tight',
                    done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'
                  )}>
                    {step.label}
                  </p>
                  {!done && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{step.tagline}</p>
                  )}
                </div>
                {done && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
                {isNext && (
                  <span className="text-[10px] font-bold text-coral-500 uppercase tracking-wide flex-shrink-0">
                    Nu
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      {nextStep && (
        <div className="px-5 pb-5">
          <button
            onClick={() => onScanOpen(nextStep.id)}
            className="w-full flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 active:scale-[0.99] transition-all rounded-xl h-11 text-sm font-semibold text-white shadow-sm"
          >
            Start {nextStep.label.toLowerCase()}
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2.5">
            {stepsDone} van {PHASE_1_STEPS.length} stappen voltooid
          </p>
        </div>
      )}
    </motion.div>
  );
}
