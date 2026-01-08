'use client';

/**
 * Pattern Quiz Landing Hero - Minimalist Pro Version
 */

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

interface PatternLandingHeroProps {
  onStartQuiz: () => void;
}

export function PatternLandingHero({ onStartQuiz }: PatternLandingHeroProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
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
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight leading-[1.1] mb-6"
          >
            Ontdek waarom je steeds op dezelfde types valt
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 mb-10 max-w-xl"
          >
            Deze wetenschappelijk onderbouwde quiz onthult je onbewuste dating patroon
            — en wat je eraan kunt doen.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <button
              onClick={onStartQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Start de quiz
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* What you'll learn */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                  <Check className="w-4 h-4 text-gray-400" />
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
        className="py-6 text-center border-t border-gray-100"
      >
        <p className="text-xs text-gray-400">
          Gebaseerd op ECR-R attachment theory • 2.400+ ingevuld
        </p>
      </motion.div>
    </div>
  );
}
