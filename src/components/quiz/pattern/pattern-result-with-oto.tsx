'use client';

/**
 * Pattern Quiz Result with OTO Integration
 *
 * Shows the FULL free analysis after email capture:
 * - Opening (patroon uitleg)
 * - Nuance
 * - Wat er bij jou gebeurt (patternExplained) — FREE
 * - Je grootste valkuil (mainPitfall) — FREE
 * - Concrete tip (concreteTip) — FREE
 *
 * Then upsells the PROGRAM (coaching, video modules, AI coach)
 * as the transformation path — not "more analysis".
 *
 * OTO and downsell are rendered as fixed overlays so the user can see
 * their result behind the modal while making the purchase decision.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Copy, CheckCircle, Sparkles, Lightbulb } from 'lucide-react';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';
import { getPatternResult } from '@/lib/quiz/pattern/pattern-results';
import { PatternOTOModal } from './pattern-oto-modal';
import { KickstartDownsellModal } from '@/components/onboarding/kickstart-downsell-modal';

interface PatternResultWithOTOProps {
  firstName: string;
  pattern: AttachmentPattern;
  anxietyScore: number;
  avoidanceScore: number;
  confidence: number;
  userId: number;
}

type OTOState = 'result' | 'oto' | 'downsell' | 'complete';

export function PatternResultWithOTO({
  firstName,
  pattern,
  anxietyScore,
  avoidanceScore,
  confidence,
  userId,
}: PatternResultWithOTOProps) {
  const router = useRouter();
  const result = getPatternResult(pattern);
  const [copied, setCopied] = useState(false);
  const [otoState, setOtoState] = useState<OTOState>('result');
  const [showCTA, setShowCTA] = useState(false);

  // CTA delay: 2.5s (down from 4s) — enough to read the opening, not so long it's annoying
  useEffect(() => {
    const timer = setTimeout(() => setShowCTA(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const trackOTOEvent = async (eventType: string, product?: string) => {
    try {
      await fetch('/api/admin/oto-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventType,
          product,
          source: 'quiz',
          patternScore: anxietyScore,
        }),
      });
    } catch (err) {
      console.error('Failed to track OTO event:', err);
    }
  };

  const handleShowOTO = () => {
    trackOTOEvent('oto_shown', 'transformatie');
    setOtoState('oto');
  };

  const handleOTOAccept = () => {
    trackOTOEvent('oto_accepted', 'transformatie');
    router.push('/checkout/transformatie?source=quiz');
  };

  const handleOTODecline = () => {
    trackOTOEvent('oto_declined', 'transformatie');
    trackOTOEvent('downsell_shown', 'kickstart');
    setOtoState('downsell');
  };

  const handleDownsellAccept = () => {
    trackOTOEvent('downsell_accepted', 'kickstart');
    router.push('/checkout/kickstart?source=quiz');
  };

  const handleDownsellDecline = () => {
    trackOTOEvent('downsell_declined', 'kickstart');
    setOtoState('complete');
    router.push('/dashboard');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Failed to copy
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* ── Full result — always rendered so it's visible behind the modal ── */}
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-gray-500 mb-2">{firstName}, jouw patroon is:</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            {result.title}
          </h1>
          <p className="text-lg text-coral-500 font-medium">
            {result.subtitle}
          </p>

          {/* Score bars */}
          <div className="mt-8 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Angst dimensie</span>
                <span className="text-gray-900 font-medium">{anxietyScore}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <motion.div
                  className="h-full bg-coral-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${anxietyScore}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Vermijding dimensie</span>
                <span className="text-gray-900 font-medium">{avoidanceScore}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <motion.div
                  className="h-full bg-coral-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${avoidanceScore}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-10">

          {/* Section 1 — Opening */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {result.opening.headline}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {result.opening.paragraph}
            </p>
          </motion.section>

          {/* Section 2 — Nuance */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-coral-50 rounded-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {result.nuance.headline}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {result.nuance.paragraph}
            </p>
          </motion.section>

          {/* Section 3 — Wat er bij jou gebeurt (UNLOCKED) */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {result.patternExplained.headline}
            </h2>
            <p className="text-gray-600 mb-4">
              {result.patternExplained.paragraph}
            </p>
            <ul className="space-y-2">
              {result.patternExplained.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <Check className="w-4 h-4 text-coral-500 mt-1 flex-shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Section 4 — Grootste Valkuil (UNLOCKED) */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 border border-gray-200 rounded-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {result.mainPitfall.headline}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {result.mainPitfall.paragraph}
            </p>
          </motion.section>

          {/* Section 5 — Concrete Tip (UNLOCKED) */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-amber-50 border border-amber-100 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">
                {result.concreteTip.headline}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {result.concreteTip.tip}
            </p>
          </motion.section>

          {/* CTA — Programma upsell (coaching, niet "meer analyse") */}
          <AnimatePresence>
            {showCTA && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 bg-gradient-to-br from-coral-500 to-coral-600 text-white rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-xl font-bold">
                    {result.ctaSection.headline}
                  </h2>
                </div>
                <p className="text-coral-100 mb-6 leading-relaxed">
                  {result.ctaSection.paragraph}
                </p>

                <ul className="space-y-2 mb-6">
                  {(result.ctaSection.bullets ?? [
                    '21-daags programma op jouw tempo',
                    'AI coach beschikbaar wanneer je twijfelt',
                    'Video modules per fase van dating',
                    'Concreet actieplan voor jouw patroon',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-coral-100">
                      <Check className="w-4 h-4 text-white flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {result.ctaSection.testimonial && (
                  <div className="mb-6 p-4 bg-white/10 rounded-xl">
                    <p className="text-sm text-coral-100 italic mb-2">
                      "{result.ctaSection.testimonial.quote}"
                    </p>
                    <p className="text-xs text-coral-200 font-medium">
                      — {result.ctaSection.testimonial.name}, {result.ctaSection.testimonial.age} jaar
                    </p>
                  </div>
                )}

                <button
                  onClick={handleShowOTO}
                  className="w-full px-8 py-4 bg-white text-coral-600 rounded-full font-semibold hover:bg-coral-50 transition-colors flex items-center justify-center gap-2"
                >
                  {result.ctaSection.buttonText}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-coral-200 text-sm mt-4 text-center">
                  Eenmalige aanbieding • 30 dagen garantie
                </p>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Share */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center pt-8 border-t border-gray-100"
          >
            <p className="text-sm text-gray-500 mb-3">Deel je resultaat</p>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-coral-500" />
                  Gekopieerd
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Kopieer link
                </>
              )}
            </button>
          </motion.div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-400 pt-4">
            <p>Gebaseerd op ECR-R attachment theory</p>
          </div>

        </div>
      </div>

      {/* ── OTO overlay — rendered on top of the result so user keeps context ── */}
      <AnimatePresence>
        {otoState === 'oto' && (
          <motion.div
            key="oto-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full my-auto"
            >
              <PatternOTOModal
                pattern={pattern}
                firstName={firstName}
                userId={userId}
                onAccept={handleOTOAccept}
                onDecline={handleOTODecline}
              />
            </motion.div>
          </motion.div>
        )}

        {otoState === 'downsell' && (
          <motion.div
            key="downsell-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full my-auto"
            >
              <KickstartDownsellModal
                score={anxietyScore / 10}
                userId={userId}
                onAccept={handleDownsellAccept}
                onDecline={handleDownsellDecline}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
