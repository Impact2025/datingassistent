'use client';

import { motion } from 'framer-motion';
import { Shield, Flag, Clock, Lock, Heart, Award } from 'lucide-react';

const colors = {
  deepPurple: 'var(--color-deep-purple, #722F37)',
  dustyRose: 'var(--color-dusty-rose, #E3867D)',
  softBlush: 'var(--color-soft-blush, #F5E6E8)',
  cream: 'var(--color-cream, #FFF8F3)',
  warmCoral: 'var(--color-warm-coral, #FF7B54)',
  sageGreen: 'var(--color-sage-green, #A8B5A0)',
  charcoal: 'var(--color-charcoal, #2D3142)',
  mediumGray: 'var(--color-medium-gray, #6B6B6B)',
};

const trustBadges = [
  {
    icon: Flag,
    title: '100% Nederlands',
    description: 'We begrijpen onze cultuur en communicatiestijl',
    color: colors.warmCoral,
  },
  {
    icon: Clock,
    title: '10+ Jaar Ervaring',
    description: 'Al sinds vóór Tinder - we kennen het vak',
    color: colors.dustyRose,
  },
  {
    icon: Lock,
    title: 'Privacy-First Filosofie',
    description: 'Jouw gegevens blijven altijd vertrouwelijk',
    color: colors.sageGreen,
  },
  {
    icon: Award,
    title: 'Wetenschappelijk Onderbouwd',
    description: 'Gebaseerd op attachment theory en psychologie',
    color: colors.deepPurple,
  },
  {
    icon: Heart,
    title: 'Geen oordeel zone',
    description: 'Iedereen verdient een tweede kans op liefde',
    color: colors.dustyRose,
  },
  {
    icon: Shield,
    title: '10.000+ Tevreden Leden',
    description: 'Waarvan 35% boven de 50 jaar - jij bent niet alleen',
    color: colors.sageGreen,
  },
];

export function TrustBuilder50Plus() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Waarom 10.000+ mensen ons vertrouwen
          </h2>
          <p className="text-lg" style={{ color: colors.mediumGray }}>
            Veiligheid en privacy staan bij ons voorop
          </p>
        </motion.div>

        {/* Trust badges grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-6 border-2 bg-white hover:shadow-lg transition-all"
              style={{ borderColor: colors.softBlush }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${badge.color}20` }}
                >
                  <badge.icon className="w-7 h-7" style={{ color: badge.color }} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: colors.deepPurple }}>
                    {badge.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: colors.mediumGray }}>
                    {badge.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom reassurance message */}
        <motion.div
          className="mt-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-lg leading-relaxed" style={{ color: colors.charcoal }}>
            We begrijpen dat opnieuw beginnen kwetsbaar is. Daarom werken we met{' '}
            <span className="font-semibold" style={{ color: colors.deepPurple }}>
              respect, privacy en professionaliteit
            </span>
            . Jouw verhaal is veilig bij ons.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default TrustBuilder50Plus;
