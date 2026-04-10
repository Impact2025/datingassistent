'use client';

/**
 * Transformatie OTO Modal - Primary One-Time-Offer
 *
 * The main conversion moment after photo analysis.
 * Offers Transformatie (€147) as the hero product.
 * Uses psychological triggers:
 * - Gap awareness (current score vs potential)
 * - Value stacking (everything included)
 * - Recommendation badge (ONZE AANRADER)
 */

import { motion } from 'framer-motion';
import { CheckCircle, Lock, ArrowRight, Video, Bot, MessageCircle, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TRANSFORMATIE_OTO } from '@/types/lead-activation.types';

interface TransformatieOTOModalProps {
  score: number;
  userId: number;
  onAccept: () => void;
  onDecline: () => void;
}

const featureIcons = [Video, Bot, MessageCircle, Users, Star];

export function TransformatieOTOModal({
  score,
  userId,
  onAccept,
  onDecline,
}: TransformatieOTOModalProps) {
  const headline = TRANSFORMATIE_OTO.headline.replace('{score}', score.toFixed(1));
  const discountPercentage = Math.round(
    ((TRANSFORMATIE_OTO.originalPrice - TRANSFORMATIE_OTO.discountedPrice) /
      TRANSFORMATIE_OTO.originalPrice) *
      100
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="bg-gray-950 dark:bg-gray-950 px-6 pt-7 pb-6 text-center relative">
        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 bg-coral-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase">
            Aanbevolen
          </span>
        </div>

        {/* Score transformation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-5"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{score.toFixed(1)}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wider">Nu</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 px-2">
            <ArrowRight className="w-5 h-5 text-coral-400" />
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">90 dagen</span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-coral-400">8+</div>
            <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wider">Doel</div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-white leading-snug"
        >
          Het Transformatie Programma
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-400 mt-1.5"
        >
          {TRANSFORMATIE_OTO.subheadline}
        </motion.p>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {/* Features */}
        <div className="space-y-2.5 mb-5">
          {TRANSFORMATIE_OTO.features.map((feature, index) => {
            const Icon = featureIcons[index] ?? CheckCircle;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.07 }}
                className="flex items-center gap-3 py-1"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-900/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-coral-500 dark:text-coral-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
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
          transition={{ delay: 0.6 }}
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
          <Button
            onClick={onAccept}
            className="w-full bg-coral-500 hover:bg-coral-600 text-white py-6 text-[15px] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {TRANSFORMATIE_OTO.ctaPrimary}
            <ArrowRight className="w-4 h-4" />
          </Button>

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
