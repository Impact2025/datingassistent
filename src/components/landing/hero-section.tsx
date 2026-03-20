'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Tv, Lock, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { IrisVideoPlayer } from '@/components/landing/iris-video-player';

export function HeroSection() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left side - Pure Messaging */}
          <div className="text-center lg:text-left order-2 lg:order-1 space-y-8">

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[0.95] mb-8">
                <span className="block mb-3">Daten is</span>
                <span className="block mb-3">geen geluk.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-gold via-coral-500 to-deep-purple animate-gradient">
                  Het is een
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-gold via-coral-500 to-deep-purple animate-gradient">
                  patroon.
                </span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Ontdek in 2 minuten waarom je steeds op de verkeerde valt.
            </motion.p>

            {/* Supporting text */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Gratis quiz gebaseerd op attachment theory
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/quiz/dating-patroon">
                <Button className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-coral-500/25 transition-all rounded-full flex items-center justify-center gap-2">
                  Start de Gratis Quiz
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 self-center">
                2 min • 10 vragen • Direct resultaat
              </p>
            </motion.div>
          </div>

          {/* Right side - Iris Video */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-full max-w-3xl">
              <IrisVideoPlayer
                ctaHref="/quiz/dating-patroon"
                ctaText="Ontdek Je Dating Patroon"
              />
            </div>
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
              <Tv className="w-5 h-5 text-coral-500" />
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
