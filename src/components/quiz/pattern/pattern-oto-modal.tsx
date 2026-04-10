'use client';

/**
 * Pattern OTO Modal — Quiz-specific conversion moment
 *
 * Shown after the free attachment analysis.
 * Copy is tailored per pattern: mirrors their specific pain,
 * then frames the program as the transformation path.
 *
 * Transformation framing: [their pattern] → Veilig Gehecht
 * No fake numeric score — uses attachment theory correctly.
 */

import { motion } from 'framer-motion';
import { CheckCircle, Lock, ArrowRight, Video, Bot, MessageCircle, Users, Map } from 'lucide-react';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';
import { TRANSFORMATIE_OTO } from '@/types/lead-activation.types';

interface PatternOTOModalProps {
  pattern: AttachmentPattern;
  firstName: string;
  userId: number;
  onAccept: () => void;
  onDecline: () => void;
}

// ─── Pattern-specific copy ────────────────────────────────────────────────────

const PATTERN_CONFIG: Record<
  AttachmentPattern,
  {
    fromLabel: string;
    toLabel: string;
    hook: string;
    featuresIntro: string;
  }
> = {
  anxious: {
    fromLabel: 'Angstig Gehecht',
    toLabel: 'Veilig Gehecht',
    hook: 'Je herkent het. Het wachten op een bericht. De twijfel of je te veel bent. Het gevoel dat je altijd iets harder trekt dan de ander.',
    featuresIntro: 'In 90 dagen breek je het angstpatroon dat je tegenhoudt — stap voor stap, met dagelijkse begeleiding.',
  },
  avoidant: {
    fromLabel: 'Vermijdend Gehecht',
    toLabel: 'Veilig Gehecht',
    hook: 'Dichtbij komen voelt onveilig. Niet omdat je het niet wil — maar omdat je nooit hebt geleerd hoe je jezelf kunt geven zonder jezelf te verliezen.',
    featuresIntro: 'In 90 dagen leer je echte verbinding opbouwen — op jouw tempo, zonder je vrijheid op te geven.',
  },
  fearful_avoidant: {
    fromLabel: 'Angstig-Vermijdend',
    toLabel: 'Veilig Gehecht',
    hook: 'Je wil nabijheid. En zodra je het bijna hebt, trek je je terug. Dat push-pull patroon saboteert elke relatie — ook de goede.',
    featuresIntro: 'In 90 dagen doorbreek je het meest complexe patroon in dating. Niet met willpower, maar met inzicht.',
  },
  secure: {
    fromLabel: 'Stabiele Basis',
    toLabel: 'De Juiste Vinden',
    hook: 'Je hebt een gezonde basis — dat is zeldzaam. Maar je trekt de verkeerde types aan. Jouw stabiliteit maakt je aantrekkelijk voor mensen die jouw niveau niet kunnen matchen.',
    featuresIntro: 'In 90 dagen leer je sneller de juiste persoon herkennen — en de verkeerde eerder loslaten.',
  },
};

// ─── Feature icons (matches feature order in TRANSFORMATIE_OTO.features) ─────

const FEATURE_ICONS = [Video, Bot, MessageCircle, Users, Map];

// ─── Discount ─────────────────────────────────────────────────────────────────

const discountPercentage = Math.round(
  ((TRANSFORMATIE_OTO.originalPrice - TRANSFORMATIE_OTO.discountedPrice) /
    TRANSFORMATIE_OTO.originalPrice) *
    100
);

// ─── Component ────────────────────────────────────────────────────────────────

export function PatternOTOModal({
  pattern,
  firstName,
  onAccept,
  onDecline,
}: PatternOTOModalProps) {
  const config = PATTERN_CONFIG[pattern];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-gray-950 px-6 pt-7 pb-6 relative">

        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center bg-coral-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase">
            Eenmalig aanbod
          </span>
        </div>

        {/* Transformation visual */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-5"
        >
          {/* From */}
          <div className="text-center">
            <div className="inline-block bg-gray-800 text-gray-300 text-sm font-semibold px-3 py-1.5 rounded-lg">
              {config.fromLabel}
            </div>
            <div className="text-[11px] text-gray-600 mt-1.5 uppercase tracking-wider">Nu</div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-0.5 pb-4">
            <ArrowRight className="w-5 h-5 text-coral-400" />
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">90 dagen</span>
          </div>

          {/* To */}
          <div className="text-center">
            <div className="inline-block bg-coral-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
              {config.toLabel}
            </div>
            <div className="text-[11px] text-gray-600 mt-1.5 uppercase tracking-wider">Doel</div>
          </div>
        </motion.div>

        {/* Program name */}
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-white text-center leading-snug"
        >
          Het Transformatie Programma
        </motion.h1>

        {/* Hook — pattern-specific */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-400 mt-2 text-center leading-relaxed"
        >
          {firstName ? `${firstName}, ` : ''}{config.hook}
        </motion.p>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5">

        {/* Features intro */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          {config.featuresIntro}
        </p>

        {/* Features list */}
        <div className="space-y-2.5 mb-5">
          {TRANSFORMATIE_OTO.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? CheckCircle;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.07 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-900/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-coral-500 dark:text-coral-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{feature}</span>
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800 mb-5" />

        {/* Price */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-center mb-4"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-gray-400 dark:text-gray-500 line-through text-base">
              €{TRANSFORMATIE_OTO.originalPrice}
            </span>
            <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
              -{discountPercentage}%
            </span>
          </div>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-5xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              €{TRANSFORMATIE_OTO.discountedPrice}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">eenmalig</span>
          </div>
          <p className="text-xs text-coral-600 dark:text-coral-400 mt-1.5 font-medium">
            Alleen nu voor nieuwe leden
          </p>
        </motion.div>

        {/* Guarantee */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-5">
          <Lock className="w-3.5 h-3.5" />
          <span>30 dagen niet-goed-geld-terug garantie</span>
        </div>

        {/* CTA */}
        <div className="space-y-2.5">
          <button
            onClick={onAccept}
            className="w-full bg-coral-500 hover:bg-coral-600 text-white py-4 text-[15px] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {TRANSFORMATIE_OTO.ctaPrimary}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onDecline}
            className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 py-2 transition-colors"
          >
            {TRANSFORMATIE_OTO.ctaSecondary}
          </button>
        </div>
      </div>
    </div>
  );
}
