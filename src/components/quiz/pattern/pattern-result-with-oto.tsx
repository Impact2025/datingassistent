'use client';

/**
 * Pattern Quiz Result with OTO Integration
 *
 * Shows quiz result with:
 * - Curiosity gap (locked sections)
 * - OTO modal sequence (Transformatie → Kickstart downsell)
 * - Account-aware state management
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, Copy, CheckCircle, Lock, Sparkles } from 'lucide-react';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';
import { getPatternResult } from '@/lib/quiz/pattern/pattern-results';
import { TransformatieOTOModal } from '@/components/onboarding/transformatie-oto-modal';
import { KickstartDownsellModal } from '@/components/onboarding/kickstart-downsell-modal';
import confetti from 'canvas-confetti';

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
  const [showOTODelay, setShowOTODelay] = useState(false);

  // Show OTO after user has seen result for a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOTODelay(true);
    }, 3000); // Show OTO button after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // Track OTO events
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
          patternScore: anxietyScore, // Use anxiety score as "engagement" metric
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
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    // Redirect to checkout
    router.push(`/checkout/transformatie-programma?userId=${userId}&discount=true&source=quiz`);
  };

  const handleOTODecline = () => {
    trackOTOEvent('oto_declined', 'transformatie');
    trackOTOEvent('downsell_shown', 'kickstart');
    setOtoState('downsell');
  };

  const handleDownsellAccept = () => {
    trackOTOEvent('downsell_accepted', 'kickstart');
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
    router.push(`/checkout/kickstart-programma?userId=${userId}&discount=true&source=quiz`);
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

  // Render OTO modals
  if (otoState === 'oto') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <TransformatieOTOModal
            score={anxietyScore}
            userId={userId}
            onAccept={handleOTOAccept}
            onDecline={handleOTODecline}
          />
        </motion.div>
      </div>
    );
  }

  if (otoState === 'downsell') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <KickstartDownsellModal
            score={anxietyScore}
            userId={userId}
            onAccept={handleDownsellAccept}
            onDecline={handleDownsellDecline}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
          <p className="text-lg text-pink-500 font-medium">
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
                  className="h-full bg-pink-500 rounded-full"
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
                  className="h-full bg-pink-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${avoidanceScore}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-10">
          {/* Opening - VISIBLE */}
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

          {/* Nuance - VISIBLE */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-pink-50 rounded-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {result.nuance.headline}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {result.nuance.paragraph}
            </p>
          </motion.section>

          {/* LOCKED SECTION 1 - Pattern Explained */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 rounded-2xl" />
            <div className="blur-sm pointer-events-none">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Hoe dit patroon je dating saboteert
              </h2>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet consectetur adipisicing elit...
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-gray-600">
                  <Check className="w-4 h-4 text-pink-500 mt-1 flex-shrink-0" />
                  <span>Verborgen inzicht over je gedrag...</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <Check className="w-4 h-4 text-pink-500 mt-1 flex-shrink-0" />
                  <span>Waarom je aangetrokken wordt tot...</span>
                </li>
              </ul>
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium">
                <Lock className="w-4 h-4" />
                <span>Ontgrendel met programma</span>
              </div>
            </div>
          </motion.section>

          {/* LOCKED SECTION 2 - Main Pitfall */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 rounded-2xl" />
            <div className="blur-sm pointer-events-none p-6 border border-gray-200 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Je Grootste Valkuil
              </h2>
              <p className="text-gray-600 leading-relaxed">
                De specifieke manier waarop dit patroon je relaties beïnvloedt...
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium">
                <Lock className="w-4 h-4" />
                <span>Ontgrendel met programma</span>
              </div>
            </div>
          </motion.section>

          {/* LOCKED SECTION 3 - Concrete Tip */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 rounded-2xl" />
            <div className="blur-sm pointer-events-none">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Jouw Persoonlijke Actieplan
              </h2>
              <p className="text-gray-600 leading-relaxed">
                De concrete stappen die je vandaag kunt nemen om dit patroon te doorbreken...
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium">
                <Lock className="w-4 h-4" />
                <span>Ontgrendel met programma</span>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <AnimatePresence>
            {showOTODelay && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-8 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-xl font-bold">
                    Ontgrendel je volledige analyse
                  </h2>
                </div>
                <p className="text-pink-100 mb-6">
                  Je hebt de eerste stap gezet. Nu is het tijd om echt te begrijpen
                  hoe dit patroon je dating beïnvloedt — en hoe je het doorbreekt.
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    'Je volledige patroon analyse',
                    'Je grootste valkuil onthuld',
                    'Persoonlijk 21-dagen actieplan',
                    'AI coaching op jouw situatie',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-pink-100">
                      <Check className="w-4 h-4 text-white flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleShowOTO}
                  className="w-full px-8 py-4 bg-white text-pink-600 rounded-full font-semibold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                >
                  Bekijk Mijn Opties
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-pink-200 text-sm mt-4 text-center">
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
                  <CheckCircle className="w-4 h-4 text-pink-500" />
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
    </div>
  );
}
