'use client';

/**
 * Pattern Quiz Landing Hero
 *
 * Landing page hero section for the Dating Pattern Quiz.
 * Follows the blueprint for maximum conversion.
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Shield, Users, CheckCircle } from 'lucide-react';

interface PatternLandingHeroProps {
  onStartQuiz: () => void;
}

export function PatternLandingHero({ onStartQuiz }: PatternLandingHeroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Waarom Blijf Je Op{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600">
                Dezelfde Types
              </span>{' '}
              Vallen?
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 font-medium">
              Ontdek je Dating Patroon in 2 minuten — en waarom het je saboteert
            </p>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Na 10 jaar en 3.000+ coaching gesprekken zie ik steeds hetzelfde:{' '}
            <strong className="text-gray-900">
              80% van je dating problemen komen voort uit één onbewust patroon.
            </strong>{' '}
            Deze wetenschappelijk onderbouwde quiz laat je zien welk patroon jij
            hebt — en wat je eraan kunt doen.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              onClick={onStartQuiz}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              Start De Quiz
              <span className="text-pink-200 ml-2">(2 min)</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-pink-500" />
              <span>Gebaseerd op de ECR-R vragenlijst</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-500" />
              <span>2.400+ keer ingevuld</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-pink-500" />
              <span>100% anoniem</span>
            </div>
          </motion.div>

          {/* What You'll Discover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-8 border-t border-gray-200"
          >
            <p className="text-sm font-medium text-gray-500 mb-4">
              Na de quiz weet je:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
              {[
                'Welk attachment type je hebt',
                'Hoe dit je dating gedrag beïnvloedt',
                'De #1 valkuil waar jij in trapt',
                'Eén concrete tip voor vandaag',
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="py-6 text-center text-xs text-gray-400"
      >
        <p>
          Wetenschappelijke basis: Experiences in Close Relationships-Revised
          (ECR-R)
        </p>
        <p className="mt-1">
          Bartholomew & Horowitz (1991) Four-Category Model of Adult Attachment
        </p>
      </motion.div>
    </div>
  );
}
