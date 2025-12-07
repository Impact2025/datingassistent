'use client';

/**
 * Kickstart OTO Modal - One-Time-Offer
 *
 * The conversion moment after photo analysis.
 * Uses psychological triggers:
 * - Gap awareness (missed matches percentage)
 * - Urgency (only now for new members)
 * - Value stacking (crossed out original price)
 */

import { motion } from 'framer-motion';
import { Rocket, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateMissedMatches, KICKSTART_OTO } from '@/types/lead-activation.types';

interface KickstartOTOModalProps {
  score: number;
  userId: number;
  onAccept: () => void;
  onDecline: () => void;
}

export function KickstartOTOModal({
  score,
  userId,
  onAccept,
  onDecline,
}: KickstartOTOModalProps) {
  const missedMatches = calculateMissedMatches(score);
  const headline = KICKSTART_OTO.headline.replace('{percentage}', missedMatches.toString());

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header - Attention Grabber */}
      <div className="bg-pink-50 p-6 text-center border-b border-pink-100">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4"
        >
          <Sparkles className="w-8 h-8 text-pink-500" />
        </motion.div>

        {/* Headline - Gap Awareness */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600"
        >
          {KICKSTART_OTO.subheadline}
        </motion.p>
      </div>

      {/* Offer Card */}
      <div className="p-6">
        {/* Program Name */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Het Kickstart Programma</h2>
            <p className="text-sm text-gray-500">21 dagen naar meer matches</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {KICKSTART_OTO.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Price Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 rounded-xl p-4 mb-6 text-center"
        >
          {/* Original Price */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-gray-400 line-through text-lg">
              {KICKSTART_OTO.originalPrice}
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
              -52%
            </span>
          </div>

          {/* Discounted Price */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-gray-900">
              {KICKSTART_OTO.discountedPrice}
            </span>
            <span className="text-gray-500">eenmalig</span>
          </div>

          {/* Urgency */}
          <p className="text-sm text-pink-600 mt-2 font-medium">
            Alleen nu voor nieuwe leden
          </p>
        </motion.div>

        {/* Guarantee Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <Lock className="w-4 h-4" />
          <span>30 dagen niet-goed-geld-terug garantie</span>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {/* Primary CTA */}
          <Button
            onClick={onAccept}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {KICKSTART_OTO.ctaPrimary}
          </Button>

          {/* Secondary CTA */}
          <Button
            onClick={onDecline}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700 py-4"
          >
            {KICKSTART_OTO.ctaSecondary}
          </Button>
        </div>
      </div>
    </div>
  );
}
