'use client';

/**
 * Pattern Quiz Landing Hero - Brand Style (Pink Minimalist)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

interface PatternLandingHeroProps {
  onStartQuiz: () => void;
}

export function PatternLandingHero({ onStartQuiz }: PatternLandingHeroProps) {
  const [quizCount, setQuizCount] = useState<number>(163);

  // Fetch real quiz count on mount
  useEffect(() => {
    fetch('/api/quiz/pattern/count')
      .then((res) => res.json())
      .then((data) => {
        if (data.count) {
          setQuizCount(data.count);
        }
      })
      .catch(() => {
        // Keep default count on error
      });
  }, []);
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Header with Logo */}
      <header className="py-4 px-4 border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Logo iconSize={28} textSize="sm" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-full">
              2 minuten • 10 vragen • Gratis
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-2"
          >
            Daten is geen geluk.
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-pink-500 tracking-tight leading-[1.1] mb-6"
          >
            Het is een patroon.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 mb-4 max-w-xl"
          >
            Ontdek je onbewuste dating patroon met deze wetenschappelijk
            onderbouwde quiz. Gebaseerd op 10+ jaar ervaring.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-gray-400 mb-8"
          >
            Anoniem. Professioneel. Effectief.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <button
              onClick={onStartQuiz}
              className="inline-flex items-center gap-2 px-8 py-4 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
            >
              Start De Quiz
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-400 mb-12"
          >
            Geen creditcard nodig • Analyse in 2 min
          </motion.p>

          {/* What you'll learn */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Na de quiz weet je
            </p>
            <div className="space-y-2">
              {[
                'Welk attachment type je hebt',
                'Hoe dit je dating gedrag beïnvloedt',
                'Eén concrete tip om het te doorbreken',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-gray-600">
                  <Check className="w-4 h-4 text-pink-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="py-6 border-t border-gray-100"
      >
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-xs text-gray-400 text-center mb-3">
            Gebaseerd op ECR-R attachment theory • {quizCount.toLocaleString('nl-NL')}+ ingevuld
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} DatingAssistent</span>
            <span>•</span>
            <Link href="/privacyverklaring" className="hover:text-pink-500 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/algemene-voorwaarden" className="hover:text-pink-500 transition-colors">
              Voorwaarden
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
