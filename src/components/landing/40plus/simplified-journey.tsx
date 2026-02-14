'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Heart, User, MessageCircle } from 'lucide-react';

const colors = {
  deepPurple: 'var(--color-deep-purple, #722F37)',
  dustyRose: 'var(--color-dusty-rose, #E3867D)',
  softBlush: 'var(--color-soft-blush, #F5E6E8)',
  warmCoral: 'var(--color-warm-coral, #FF7B54)',
  sageGreen: 'var(--color-sage-green, #A8B5A0)',
  charcoal: 'var(--color-charcoal, #2D3142)',
  mediumGray: 'var(--color-medium-gray, #6B6B6B)',
  iconPurple: 'var(--icon-strategy, #8B7BA8)',
};

const journeySteps = [
  {
    num: '1',
    title: 'Zelfontdekking',
    period: 'Week 1-2',
    color: colors.warmCoral,
    icon: Heart,
    activities: [
      'Emotionele Ready Scan - ben je klaar?',
      'Dating Patroon Analyse',
      'Profiel Privacy Check',
    ],
    result: 'Je weet precies waar je staat',
  },
  {
    num: '2',
    title: 'Profiel & Strategie',
    period: 'Week 3-4',
    color: colors.iconPurple,
    icon: User,
    activities: [
      'Foto Optimalisatie (geen nieuwe foto\'s verplicht!)',
      'Bio Schrijfhulp voor 40-plussers',
      'Privacy Instellingen configureren',
    ],
    result: 'Een profiel dat past bij jou',
  },
  {
    num: '3',
    title: 'Connectie & Groei',
    period: 'Doorlopend',
    color: colors.sageGreen,
    icon: MessageCircle,
    activities: [
      'Chat Coach voor echte gesprekken',
      'Date Voorbereiding & tips',
      'Patroon Herkenning & feedback',
    ],
    result: 'Dates met mensen die écht passen',
  },
];

export function SimplifiedJourney() {
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
            Jouw Reis in 3 Heldere Stappen
          </h2>
          <p className="text-lg" style={{ color: colors.mediumGray }}>
            Geen ingewikkelde processen - gewoon een duidelijk pad vooruit
          </p>
        </motion.div>

        {/* Journey steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line (desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: colors.softBlush, zIndex: 0 }} />

          {journeySteps.map((step, i) => (
            <motion.div
              key={i}
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
            >
              <div className="bg-white rounded-2xl p-8 border-2 hover:shadow-xl transition-all" style={{ borderColor: colors.softBlush }}>
                {/* Step number badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold" style={{ color: colors.deepPurple }}>
                      {step.title}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: step.color }}>
                      {step.period}
                    </p>
                  </div>
                </div>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>

                {/* Activities list */}
                <ul className="space-y-3 mb-6">
                  {step.activities.map((activity, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: colors.charcoal }}>
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: step.color }} />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>

                {/* Result */}
                <div className="pt-4 border-t-2" style={{ borderColor: colors.softBlush }}>
                  <p className="text-sm font-semibold flex items-center gap-2" style={{ color: step.color }}>
                    <span className="text-lg">→</span>
                    {step.result}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom reassurance */}
        <motion.div
          className="mt-16 text-center max-w-3xl mx-auto p-8 rounded-2xl"
          style={{ backgroundColor: colors.softBlush }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-lg leading-relaxed mb-4" style={{ color: colors.charcoal }}>
            <span className="font-bold" style={{ color: colors.deepPurple }}>
              Ga in je eigen tempo.
            </span>{' '}
            Er is geen tijdsdruk. Sommige 40-plussers doorlopen dit in 3 weken, anderen nemen 3 maanden. Beide zijn prima.
          </p>
          <p className="text-base" style={{ color: colors.mediumGray }}>
            Je hebt al genoeg druk in je leven - dit moet juist ontspannen voelen.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default SimplifiedJourney;
