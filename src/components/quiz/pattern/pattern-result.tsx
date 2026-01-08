'use client';

/**
 * Pattern Quiz Result Component - Brand Style (Pink Minimalist)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, Copy, CheckCircle } from 'lucide-react';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';
import { getPatternResult } from '@/lib/quiz/pattern/pattern-results';

interface PatternResultProps {
  firstName: string;
  pattern: AttachmentPattern;
  anxietyScore: number;
  avoidanceScore: number;
  confidence: number;
}

export function PatternResult({
  firstName,
  pattern,
  anxietyScore,
  avoidanceScore,
}: PatternResultProps) {
  const result = getPatternResult(pattern);
  const [copied, setCopied] = useState(false);

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
          {/* Opening */}
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

          {/* Nuance */}
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

          {/* Pattern Explained */}
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
              {result.patternExplained.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-600">
                  <Check className="w-4 h-4 text-pink-500 mt-1 flex-shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Main Pitfall */}
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

          {/* Concrete Tip */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {result.concreteTip.headline}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {result.concreteTip.tip}
            </p>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-8 bg-gray-900 text-white rounded-2xl"
          >
            <h2 className="text-xl font-bold mb-3">
              {result.ctaSection.headline}
            </h2>
            <p className="text-gray-300 mb-6">
              {result.ctaSection.paragraph}
            </p>

            {result.ctaSection.bullets && (
              <ul className="space-y-2 mb-6">
                {result.ctaSection.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <Check className="w-4 h-4 text-pink-400 mt-1 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/transformatie"
              className="inline-flex items-center gap-2 px-8 py-4 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
            >
              {result.ctaSection.buttonText}
              <ArrowRight className="w-5 h-5" />
            </Link>

            {result.ctaSection.testimonial && (
              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-gray-400 italic">
                  "{result.ctaSection.testimonial.quote}"
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  — {result.ctaSection.testimonial.name}, {result.ctaSection.testimonial.age}
                </p>
              </div>
            )}
          </motion.section>

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
