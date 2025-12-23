'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Tv, Lock, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function AnimatedScoreMockup() {
  const [score, setScore] = useState(4.2);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Animate score from 4.2 to 8.1
    const scoreTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setScore((prev) => {
          if (prev >= 8.1) {
            clearInterval(interval);
            return 8.1;
          }
          return Math.min(prev + 0.2, 8.1);
        });
      }, 100);
      return () => clearInterval(interval);
    }, 1000);

    // Show chat message after score animation
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
    }, 3000);

    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(messageTimer);
    };
  }, []);

  const scoreColor = score < 5 ? 'text-red-500' : score < 7 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="relative w-[280px] sm:w-[320px] mx-auto">
      {/* Phone frame */}
      <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden">
          {/* Phone notch */}
          <div className="bg-gray-900 h-6 flex items-center justify-center">
            <div className="w-20 h-4 bg-gray-900 rounded-b-xl" />
          </div>

          {/* Screen content */}
          <div className="p-4 min-h-[400px]">
            {/* Profile preview */}
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-200 to-pink-300 rounded-full mb-2 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Jouw Profiel</p>
            </div>

            {/* Score display */}
            <motion.div
              className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">AI Profiel Score</p>
              <div className="flex items-baseline gap-2">
                <motion.span
                  className={`text-4xl font-bold ${scoreColor}`}
                  key={score.toFixed(1)}
                >
                  {score.toFixed(1)}
                </motion.span>
                <span className="text-gray-400">/10</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 to-green-500 rounded-full"
                  initial={{ width: '42%' }}
                  animate={{ width: `${(score / 10) * 100}%` }}
                  transition={{ duration: 2, delay: 1 }}
                />
              </div>
            </motion.div>

            {/* Improvement tips */}
            <motion.div
              className="space-y-2 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                <span className="text-gray-600 dark:text-gray-300">Goede belichting</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600">!</span>
                <span className="text-gray-600 dark:text-gray-300">Voeg hobby-foto toe</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-pink-600">💡</span>
                <span className="text-gray-600 dark:text-gray-300">Bio kan sterker</span>
              </div>
            </motion.div>

            {/* Chat suggestion */}
            {showMessage && (
              <motion.div
                className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">💬 Openingszin voor Lisa:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                  "Hey! Ik zag dat je van wandelen houdt - ken je die route bij..."
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left side - Text & CTA */}
          <div className="text-center lg:text-left order-2 lg:order-1">

            {/* Headline */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Daten is geen geluk.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600">
                Het is een strategie.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              De eerste AI-assistent die je datingleven optimaliseert, 24/7 beschikbaar,
              gebaseerd op 10+ jaar ervaring. Van de eerste foto tot de eerste date.
              <span className="block mt-2 font-medium text-gray-700 dark:text-gray-200">
                Aangedreven door de methodiek van Vincent van Munster.
              </span>
              <span className="block mt-1 text-sm text-gray-500 dark:text-gray-400">
                Anoniem. Professioneel. Effectief.
              </span>
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              className="flex flex-col items-center lg:items-start gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2">
                  Doe de Gratis Profiel Check
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              {/* Micro-copy */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Geen creditcard nodig • Analyse in 30 sec
              </p>

              {/* Secondary link */}
              <Link
                href="#hoe-het-werkt"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 underline underline-offset-4 transition-colors"
              >
                Of bekijk hoe het werkt
              </Link>
            </motion.div>
          </div>

          {/* Right side - Phone Mockup */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatedScoreMockup />
          </motion.div>
        </div>

        {/* Social Proof Bar */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Tv className="w-5 h-5 text-pink-500" />
              <span className="text-sm font-medium">10+ Jaar ervaring (Bekend van TV)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Lock className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">100% Privacy & Veilig</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Flag className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Nederlands product</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
