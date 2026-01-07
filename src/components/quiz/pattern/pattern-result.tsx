'use client';

/**
 * Pattern Quiz Result Component
 *
 * Displays the full result page for a completed quiz.
 * Follows the blueprint structure for maximum conversion.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Target,
  CheckCircle,
  Quote,
  TrendingUp,
} from 'lucide-react';
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
  confidence,
}: PatternResultProps) {
  const result = getPatternResult(pattern);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-center space-y-4"
        >
          {/* Pattern Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium"
            style={{ backgroundColor: result.color }}
          >
            <span>{result.title}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {firstName}, jouw Dating Patroon is:
          </h1>
          <h2
            className="text-4xl sm:text-5xl font-bold"
            style={{ color: result.color }}
          >
            {result.title}
          </h2>
          <p className="text-lg text-gray-600">{result.subtitle}</p>

          {/* Dimension Scores */}
          <div className="flex justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Angst Dimensie</div>
              <div className="text-2xl font-bold text-gray-900">
                {anxietyScore}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">
                Vermijding Dimensie
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {avoidanceScore}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Zekerheid</div>
              <div className="text-2xl font-bold" style={{ color: result.color }}>
                {confidence}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Opening Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4" style={{ borderLeftColor: result.color }}>
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {result.opening.headline}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {result.opening.paragraph}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Nuance Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {result.nuance.headline}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {result.nuance.paragraph}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pattern Explained Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${result.color}20` }}
                >
                  <TrendingUp
                    className="w-5 h-5"
                    style={{ color: result.color }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {result.patternExplained.headline}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {result.patternExplained.paragraph}
                  </p>
                  <ul className="space-y-2">
                    {result.patternExplained.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle
                          className="w-4 h-4 mt-1 flex-shrink-0"
                          style={{ color: result.color }}
                        />
                        <span className="text-gray-700">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Pitfall Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {result.mainPitfall.headline}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {result.mainPitfall.paragraph}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Concrete Tip Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {result.concreteTip.headline}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {result.concreteTip.tip}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.6 }}
        >
          <Card
            className="border-2 overflow-hidden"
            style={{ borderColor: result.color }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 text-white"
              style={{ backgroundColor: result.color }}
            >
              <h3 className="text-xl font-bold">{result.ctaSection.headline}</h3>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <p className="text-gray-700 leading-relaxed">
                {result.ctaSection.paragraph}
              </p>

              {result.ctaSection.bullets && (
                <ul className="space-y-2">
                  {result.ctaSection.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle
                        className="w-4 h-4 mt-1 flex-shrink-0 text-green-500"
                      />
                      <span className="text-gray-700">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA Button */}
              <Link href="/transformatie">
                <Button
                  size="lg"
                  className="w-full text-white text-lg py-6 font-semibold"
                  style={{ backgroundColor: result.color }}
                >
                  {result.ctaSection.buttonText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              {/* Testimonial */}
              {result.ctaSection.testimonial && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <Quote className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 italic">
                        "{result.ctaSection.testimonial.quote}"
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        — {result.ctaSection.testimonial.name},{' '}
                        {result.ctaSection.testimonial.age}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-gray-500 py-8"
        >
          <p>
            Twijfel je? Reply op de email die we je gestuurd hebben.
            <br />
            Vincent leest alles persoonlijk.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
