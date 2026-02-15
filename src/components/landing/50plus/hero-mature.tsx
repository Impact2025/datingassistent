'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Tv, Flag } from 'lucide-react';

const colors = {
  deepPurple: 'var(--color-deep-purple, #722F37)',
  dustyRose: 'var(--color-dusty-rose, #E3867D)',
  softBlush: 'var(--color-soft-blush, #F5E6E8)',
  cream: 'var(--color-cream, #FFF8F3)',
  warmCoral: 'var(--color-warm-coral, #FF7B54)',
  sageGreen: 'var(--color-sage-green, #A8B5A0)',
  charcoal: 'var(--color-charcoal, #2D3142)',
  mediumGray: 'var(--color-medium-gray, #6B6B6B)',
  roseGold: 'var(--color-rose-gold, #B76E79)',
};

export function HeroMature50Plus() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-24 px-4 overflow-hidden" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left order-2 lg:order-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8">
                <span className="block mb-3" style={{ color: colors.charcoal }}>
                  Daten na 50?
                </span>
                <span className="block mb-3" style={{ color: colors.roseGold }}>
                  Jij weet wat
                </span>
                <span className="block mb-3" style={{ color: colors.roseGold }}>
                  je wil en wat
                </span>
                <span className="block" style={{ color: colors.roseGold }}>
                  je niet wil.
                </span>
                <span className="block mt-3" style={{ color: colors.deepPurple }}>
                  Dát is kracht.
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-xl sm:text-2xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
              style={{ color: colors.charcoal }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Vind een partner die bij je levensfase past - met respect voor je privacy en tijd
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/quiz/emotionele-readiness-50plus">
                <Button
                  className="text-white px-10 py-7 text-xl font-semibold shadow-xl rounded-full flex items-center gap-3"
                  style={{
                    backgroundColor: colors.warmCoral,
                    boxShadow: '0 4px 16px var(--color-warm-coral-shadow, rgba(255, 123, 84, 0.3))'
                  }}
                >
                  Start gratis persoonlijkheidsanalyse <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>
            </motion.div>

            <motion.p
              className="text-base self-center text-center lg:text-left"
              style={{ color: colors.mediumGray }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              5 min • Volledige discretie • Persoonlijk advies
            </motion.p>
          </div>

          {/* Right column - Professional image */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative w-full max-w-lg">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/50plus-hero.jpg"
                  alt="50-plus stel geniet van quality time samen - daten na 50 jaar met vertrouwen en zelfkennis"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Decorative gradient border */}
              <div
                className="absolute inset-0 rounded-3xl -z-10 blur-xl opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.roseGold})`
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Trust Bar - Privacy focused for 50+ */}
        <motion.div
          className="mt-16 pt-10 border-t flex flex-wrap items-center justify-center gap-8 lg:gap-12"
          style={{ borderColor: colors.softBlush }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: Lock, text: 'Absolute discretie', color: colors.sageGreen },
            { icon: Flag, text: '100% Nederlands', color: colors.warmCoral },
            { icon: Tv, text: '10+ jaar ervaring', color: colors.dustyRose },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3" style={{ color: colors.charcoal }}>
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
              <span className="text-base font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default HeroMature50Plus;
