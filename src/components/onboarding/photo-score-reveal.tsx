'use client';

/**
 * Photo Score Reveal - The Gap Creator
 *
 * Shows the photo analysis result with:
 * - Animated score circle
 * - One visible "strong point" (the free win)
 * - One visible "critical point"
 * - Three blurred/locked categories (the cliffhanger)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PhotoAnalysisResult } from '@/types/lead-activation.types';
import { extractOnboardingResult } from '@/types/lead-activation.types';

interface PhotoScoreRevealProps {
  result: PhotoAnalysisResult;
  onContinue: () => void;
}

export function PhotoScoreReveal({ result, onContinue }: PhotoScoreRevealProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const onboardingResult = extractOnboardingResult(result);

  // Animate score counting up
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 30;
    const increment = result.overall_score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, result.overall_score);
      setAnimatedScore(current);

      if (step >= steps) {
        clearInterval(timer);
        // Show content after score animation
        setTimeout(() => setShowContent(true), 300);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.overall_score]);

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreRingColor = (score: number): string => {
    if (score >= 8) return 'stroke-green-500';
    if (score >= 6) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 8) return 'Uitstekend!';
    if (score >= 7) return 'Goed';
    if (score >= 6) return 'Voldoende';
    if (score >= 5) return 'Gemiddeld';
    return 'Kan beter';
  };

  // Calculate stroke dashoffset for circular progress
  const circumference = 2 * Math.PI * 58; // radius = 58
  const progress = (animatedScore / 10) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
      {/* Score Circle */}
      <div className="relative w-40 h-40 mx-auto mb-8">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="58"
            className="fill-none stroke-gray-200"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r="58"
            className={cn('fill-none', getScoreRingColor(result.overall_score))}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'text-4xl font-bold',
              getScoreColor(result.overall_score)
            )}
          >
            {animatedScore.toFixed(1)}
          </span>
          <span className="text-gray-500 text-sm">/10</span>
        </div>
      </div>

      {/* Score Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        className="text-center mb-8"
      >
        <p
          className={cn(
            'text-lg font-semibold',
            getScoreColor(result.overall_score)
          )}
        >
          {getScoreLabel(result.overall_score)}
        </p>
      </motion.div>

      {/* Feedback Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Strong Point (The Free Win) */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 mb-1">
                Sterk punt: {onboardingResult.strongPoint.category}
              </p>
              <p className="text-sm text-green-700">
                {onboardingResult.strongPoint.feedback}
              </p>
              <span className="inline-block mt-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {onboardingResult.strongPoint.scoreBoost}
              </span>
            </div>
          </div>
        </div>

        {/* Critical Point (Visible) */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 mb-1">
                Kritiek punt: {onboardingResult.criticalPoint.category}
              </p>
              <p className="text-sm text-amber-700">
                {onboardingResult.criticalPoint.feedback}
              </p>
            </div>
          </div>
        </div>

        {/* Locked Categories (The Cliffhanger) */}
        <div className="relative">
          <div className="space-y-3">
            {onboardingResult.lockedCategories.map((category, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative overflow-hidden"
              >
                <div className="blur-sm opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      <span className="font-medium text-gray-700">
                        {category.category}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-700">
                      {category.score.toFixed(1)}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Gedetailleerde feedback en verbeterpunten...
                  </p>
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/30">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 rounded-full">
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white">
                      Ontgrendel volledige rapport
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Button
          onClick={onContinue}
          className="w-full bg-coral-500 hover:bg-coral-600 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Bekijk hoe je verbetert
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
