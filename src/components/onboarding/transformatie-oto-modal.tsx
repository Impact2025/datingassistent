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
import { Sparkles, CheckCircle, Lock, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TRANSFORMATIE_OTO } from '@/types/lead-activation.types';

interface TransformatieOTOModalProps {
  score: number;
  userId: number;
  onAccept: () => void;
  onDecline: () => void;
}

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
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border-2 border-coral-200 dark:border-coral-700 overflow-hidden">
      {/* Header - Attention Grabber */}
      <div className="bg-gradient-to-r from-coral-50 to-coral-100 dark:from-coral-900/30 dark:to-coral-800/30 p-6 text-center border-b border-coral-100 dark:border-coral-700 relative">
        {/* ONZE AANRADER Badge */}
        <Badge className="absolute top-4 right-4 bg-coral-500 dark:bg-coral-600 text-white px-3 py-1 text-xs font-bold shadow-md">
          ONZE AANRADER
        </Badge>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <Trophy className="w-8 h-8 text-white" />
        </motion.div>

        {/* Headline - Gap Awareness */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2"
        >
          {headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-300"
        >
          {TRANSFORMATIE_OTO.subheadline}
        </motion.p>
      </div>

      {/* Offer Card */}
      <div className="p-6">
        {/* Program Name */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral-100 to-coral-200 dark:from-coral-900/50 dark:to-coral-800/50 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-coral-500 dark:text-coral-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Het Transformatie Programma</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">De complete opleiding tot succesvol daten</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {TRANSFORMATIE_OTO.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Price Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-coral-50 to-coral-100 dark:from-coral-900/30 dark:to-coral-800/30 rounded-xl p-4 mb-6 text-center border border-coral-100 dark:border-coral-700"
        >
          {/* Original Price */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-gray-400 dark:text-gray-500 line-through text-lg">
              €{TRANSFORMATIE_OTO.originalPrice}
            </span>
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
              -{discountPercentage}%
            </span>
          </div>

          {/* Discounted Price */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-coral-600 dark:text-coral-400">
              €{TRANSFORMATIE_OTO.discountedPrice}
            </span>
            <span className="text-gray-500 dark:text-gray-400">eenmalig</span>
          </div>

          {/* Urgency */}
          <p className="text-sm text-coral-600 dark:text-coral-400 mt-2 font-medium">
            Alleen nu voor nieuwe leden
          </p>
        </motion.div>

        {/* Guarantee Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Lock className="w-4 h-4" />
          <span>30 dagen niet-goed-geld-terug garantie</span>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {/* Primary CTA */}
          <Button
            onClick={onAccept}
            className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {TRANSFORMATIE_OTO.ctaPrimary}
            <ArrowRight className="w-5 h-5" />
          </Button>

          {/* Secondary CTA */}
          <Button
            onClick={onDecline}
            variant="ghost"
            className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-4"
          >
            {TRANSFORMATIE_OTO.ctaSecondary}
          </Button>
        </div>
      </div>
    </div>
  );
}
