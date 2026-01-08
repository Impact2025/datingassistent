'use client';

/**
 * Pattern Quiz Result Component - WORLD CLASS VERSION
 *
 * Dramatic, memorable result reveal with animations, score visualization,
 * attachment quadrant chart, and conversion-optimized CTA section.
 */

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  Heart,
  Shield,
  Zap,
  Share2,
  Copy,
  Sparkles,
  Star,
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

// Confetti particle component
function Confetti({ color }: { color: string }) {
  const particles = useMemo(() =>
    [...Array(50)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.id % 3 === 0 ? color : p.id % 3 === 1 ? '#EC4899' : '#8B5CF6',
            rotate: p.rotation,
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{
            y: window.innerHeight + 50,
            opacity: [1, 1, 0],
            rotate: p.rotation + 720,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Animated score meter
function ScoreMeter({ label, score, color, delay }: { label: string; score: number; color: string; delay: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let current = 0;
      const increment = score / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, 30);
      return () => clearInterval(timer);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [score, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <div className="relative w-24 h-24 mx-auto mb-2">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Animated progress ring */}
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 251.2' }}
            animate={{ strokeDasharray: `${(animatedScore / 100) * 251.2} 251.2` }}
            transition={{ delay, duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{animatedScore}%</span>
        </div>
      </div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </motion.div>
  );
}

// Attachment Quadrant Chart
function AttachmentQuadrant({
  anxietyScore,
  avoidanceScore,
  color,
}: {
  anxietyScore: number;
  avoidanceScore: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <h4 className="text-center text-sm font-medium text-gray-500 mb-4">
        Jouw positie op het Attachment Model
      </h4>
      <div className="relative w-full aspect-square max-w-[280px] mx-auto">
        {/* Quadrant labels */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 text-xs text-green-600 font-medium">
          Secure
        </div>
        <div className="absolute top-0 right-1/4 translate-x-1/2 text-xs text-amber-600 font-medium">
          Anxious
        </div>
        <div className="absolute bottom-0 left-1/4 -translate-x-1/2 text-xs text-indigo-600 font-medium">
          Avoidant
        </div>
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 text-xs text-red-600 font-medium">
          Fearful
        </div>

        {/* Grid */}
        <div className="absolute inset-0 border border-gray-200 rounded-lg overflow-hidden">
          {/* Quadrant backgrounds */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-50/50" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-50/50" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-50/50" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-red-50/50" />

          {/* Center lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />

          {/* User position */}
          <motion.div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg"
            style={{
              backgroundColor: color,
              left: `${anxietyScore}%`,
              top: `${100 - avoidanceScore}%`,
              transform: 'translate(-50%, 50%)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Axis labels */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-400">
          Laag Vermijding
        </div>
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-90 text-xs text-gray-400">
          Hoog Vermijding
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-xs text-gray-400 pt-1">
          Laag Angst → Hoog Angst
        </div>
      </div>
    </motion.div>
  );
}

// Pattern icon mapping
const PatternIcon = {
  SECURE: Heart,
  ANXIOUS: Zap,
  AVOIDANT: Shield,
  FEARFUL_AVOIDANT: Sparkles,
};

// Animated section wrapper with scroll trigger
function AnimatedSection({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PatternResult({
  firstName,
  pattern,
  anxietyScore,
  avoidanceScore,
  confidence,
}: PatternResultProps) {
  const result = getPatternResult(pattern);
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const Icon = PatternIcon[pattern] || Heart;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Confetti celebration */}
      <AnimatePresence>
        {showConfetti && <Confetti color={result.color} />}
      </AnimatePresence>

      {/* Hero Section - Dark dramatic reveal */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${result.color}30 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-24">
          {/* Pattern reveal animation */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon with glow */}
            <motion.div
              className="relative w-24 h-24 mx-auto mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: result.color }}
                animate={{
                  boxShadow: [
                    `0 0 30px ${result.color}80`,
                    `0 0 60px ${result.color}80`,
                    `0 0 30px ${result.color}80`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute inset-0 rounded-full flex items-center justify-center">
                <Icon className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Personalized greeting */}
            <motion.p
              className="text-white/60 text-lg mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {firstName}, jouw Dating Patroon is:
            </motion.p>

            {/* Pattern title - dramatic reveal */}
            <motion.h1
              className="text-5xl sm:text-7xl font-bold mb-4"
              style={{ color: result.color }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5, type: 'spring' }}
            >
              {result.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-white/80 text-xl max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {result.subtitle}
            </motion.p>

            {/* Score meters */}
            <div className="flex justify-center gap-8 sm:gap-12 mt-12">
              <ScoreMeter
                label="Angst Dimensie"
                score={anxietyScore}
                color={result.color}
                delay={1}
              />
              <ScoreMeter
                label="Vermijding"
                score={avoidanceScore}
                color="#8B5CF6"
                delay={1.1}
              />
              <ScoreMeter
                label="Zekerheid"
                score={confidence}
                color="#10B981"
                delay={1.2}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section - Light background */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8">
          {/* Attachment Quadrant */}
          <AnimatedSection>
            <AttachmentQuadrant
              anxietyScore={anxietyScore}
              avoidanceScore={avoidanceScore}
              color={result.color}
            />
          </AnimatedSection>

          {/* Opening Section */}
          <AnimatedSection delay={0.1}>
            <Card className="border-l-4 shadow-lg" style={{ borderLeftColor: result.color }}>
              <CardContent className="p-6 sm:p-8">
                <motion.h3
                  className="text-2xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {result.opening.headline}
                </motion.h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {result.opening.paragraph}
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Nuance Section */}
          <AnimatedSection delay={0.1}>
            <Card className="bg-amber-50/50 border-amber-200 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="p-3 bg-amber-100 rounded-xl flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </motion.div>
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
          </AnimatedSection>

          {/* Pattern Explained Section */}
          <AnimatedSection delay={0.1}>
            <Card className="shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: `${result.color}20` }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <TrendingUp className="w-6 h-6" style={{ color: result.color }} />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {result.patternExplained.headline}
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {result.patternExplained.paragraph}
                    </p>
                    <ul className="space-y-3">
                      {result.patternExplained.bullets.map((bullet, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CheckCircle
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            style={{ color: result.color }}
                          />
                          <span className="text-gray-700">{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Main Pitfall Section */}
          <AnimatedSection delay={0.1}>
            <Card className="bg-red-50/50 border-red-200 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="p-3 bg-red-100 rounded-xl flex-shrink-0"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Target className="w-6 h-6 text-red-600" />
                  </motion.div>
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
          </AnimatedSection>

          {/* Concrete Tip Section */}
          <AnimatedSection delay={0.1}>
            <Card className="bg-green-50/50 border-green-200 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="p-3 bg-green-100 rounded-xl flex-shrink-0"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Lightbulb className="w-6 h-6 text-green-600" />
                  </motion.div>
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
          </AnimatedSection>

          {/* CTA Section - Premium design */}
          <AnimatedSection delay={0.1}>
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              {/* Background gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${result.color} 0%, ${result.color}dd 50%, #7C3AED 100%)`,
                }}
              />

              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-64 h-64 rounded-full border border-white"
                    style={{
                      left: `${i * 20}%`,
                      top: `${(i % 3) * 30}%`,
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                  />
                ))}
              </div>

              <div className="relative p-8 sm:p-10">
                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-white/90 text-sm font-medium">
                    Speciaal voor {result.title}
                  </span>
                </motion.div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  {result.ctaSection.headline}
                </h3>

                <p className="text-white/90 leading-relaxed text-lg mb-6">
                  {result.ctaSection.paragraph}
                </p>

                {result.ctaSection.bullets && (
                  <ul className="space-y-3 mb-8">
                    {result.ctaSection.bullets.map((bullet, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
                        <span className="text-white/90">{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <Link href="/transformatie">
                  <motion.button
                    className="w-full bg-white text-gray-900 rounded-xl py-4 px-8 font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {result.ctaSection.buttonText}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>

                {/* Testimonial */}
                {result.ctaSection.testimonial && (
                  <motion.div
                    className="mt-8 pt-6 border-t border-white/20"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <Quote className="w-8 h-8 text-white/30 flex-shrink-0" />
                      <div>
                        <p className="text-white/90 italic text-lg">
                          "{result.ctaSection.testimonial.quote}"
                        </p>
                        <p className="text-white/60 mt-2">
                          — {result.ctaSection.testimonial.name},{' '}
                          {result.ctaSection.testimonial.age}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Share Section */}
          <AnimatedSection delay={0.1}>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Deel je resultaat met vrienden</p>
              <div className="flex flex-wrap justify-center gap-3">
                {/* Native Share (mobile) */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <motion.button
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: `Mijn Dating Patroon: ${result.title}`,
                          text: `Ik heb net de Dating Patroon Quiz gedaan en ik ben "${result.title}". Benieuwd naar jouw patroon?`,
                          url: window.location.href,
                        });
                      } catch {
                        // User cancelled or share failed
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Delen</span>
                  </motion.button>
                )}

                {/* WhatsApp */}
                <motion.a
                  href={`https://wa.me/?text=${encodeURIComponent(`Ik heb net de Dating Patroon Quiz gedaan en ik ben "${result.title}"! 🔥 Benieuwd naar jouw patroon? ${typeof window !== 'undefined' ? window.location.origin : ''}/quiz/dating-patroon`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-medium shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </motion.a>

                {/* Copy Link */}
                <motion.button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Gekopieerd!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Kopieer link</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </AnimatedSection>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-gray-500 py-8 border-t border-gray-200"
          >
            <p>
              Twijfel je? Reply op de email die we je gestuurd hebben.
              <br />
              Vincent leest alles persoonlijk.
            </p>
            <p className="mt-4 text-xs text-gray-400">
              Gebaseerd op ECR-R attachment theory • 10.000+ analyses
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
