'use client';

/**
 * Kickstart Downsell Modal
 *
 * Shown after user declines Transformatie OTO.
 * Offers Kickstart (€47) as a lower-commitment alternative.
 * Uses:
 * - Empathy ("Te snel?")
 * - Lower barrier to entry
 * - Future upgrade path messaging
 */

import { motion } from 'framer-motion';
import { Rocket, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KICKSTART_DOWNSELL } from '@/types/lead-activation.types';

interface KickstartDownsellModalProps {
  score: number;
  userId: number;
  onAccept: () => void;
  onDecline: () => void;
}

export function KickstartDownsellModal({
  score,
  userId,
  onAccept,
  onDecline,
}: KickstartDownsellModalProps) {
  const discountPercentage = Math.round(
    ((KICKSTART_DOWNSELL.originalPrice - KICKSTART_DOWNSELL.discountedPrice) /
      KICKSTART_DOWNSELL.originalPrice) *
      100
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header - Empathetic */}
      <div className="bg-gray-50 dark:bg-gray-700 p-6 text-center border-b border-gray-100 dark:border-gray-600">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mx-auto mb-4"
        >
          <Rocket className="w-8 h-8 text-gray-600 dark:text-gray-300" />
        </motion.div>

        {/* Headline - Empathetic */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2"
        >
          {KICKSTART_DOWNSELL.headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-300"
        >
          {KICKSTART_DOWNSELL.subheadline}
        </motion.p>
      </div>

      {/* Offer Card */}
      <div className="p-6">
        {/* Program Name */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Het Kickstart Programma</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">21 dagen naar meer matches</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {KICKSTART_DOWNSELL.features.map((feature, index) => (
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

        {/* Upgrade Path Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            <span className="font-medium">Tip:</span> Je kunt later altijd upgraden naar Transformatie.
            <br />
            <span className="text-blue-600 dark:text-blue-400">Je Kickstart investering wordt dan verrekend!</span>
          </p>
        </div>

        {/* Price Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-center"
        >
          {/* Original Price */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-gray-400 dark:text-gray-500 line-through text-lg">
              €{KICKSTART_DOWNSELL.originalPrice}
            </span>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
              -{discountPercentage}%
            </span>
          </div>

          {/* Discounted Price */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-50">
              €{KICKSTART_DOWNSELL.discountedPrice}
            </span>
            <span className="text-gray-500 dark:text-gray-400">eenmalig</span>
          </div>

          {/* Value comparison */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Minder dan een etentje, méér dan een jaar app-abonnement
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
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {KICKSTART_DOWNSELL.ctaPrimary}
            <ArrowRight className="w-5 h-5" />
          </Button>

          {/* Secondary CTA */}
          <Button
            onClick={onDecline}
            variant="ghost"
            className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-4"
          >
            {KICKSTART_DOWNSELL.ctaSecondary}
          </Button>
        </div>
      </div>
    </div>
  );
}
