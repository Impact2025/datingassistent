'use client';

/**
 * How It Works Section
 *
 * Shows the 3-step process for new users:
 * 1. Upload photo → AI analyzes
 * 2. Get personalized score + insights
 * 3. Start improvement journey
 *
 * Targeted by the "Of bekijk hoe het werkt" link in the hero.
 */

import { motion } from 'framer-motion';
import { Upload, Sparkles, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Upload je profielfoto',
    description: 'Upload een foto van je dating profiel. Onze AI analyseert meer dan 50 factoren.',
    duration: '30 seconden',
  },
  {
    number: 2,
    icon: Sparkles,
    title: 'Ontvang je score & inzichten',
    description: 'Krijg direct een score van 1-10 met concrete verbeterpunten voor meer matches.',
    duration: 'Direct resultaat',
  },
  {
    number: 3,
    icon: TrendingUp,
    title: 'Start je transformatie',
    description: 'Volg het programma en zie je matches toenemen. Bewezen door 10.000+ mannen.',
    duration: '21-90 dagen',
  },
];

interface HowItWorksSectionProps {
  className?: string;
}

export function HowItWorksSection({ className }: HowItWorksSectionProps) {
  return (
    <section id="hoe-het-werkt" className={className || 'py-16 md:py-24 bg-gray-50 dark:bg-gray-900'}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-medium rounded-full mb-4"
          >
            In 3 simpele stappen
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Hoe het werkt
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Van profielfoto tot meer dates - in minder dan 5 minuten weet je precies wat je moet verbeteren.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line (hidden on mobile, shown on md+) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-pink-300 to-pink-100 dark:from-pink-700 dark:to-pink-900" />
              )}

              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                {/* Step number badge */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center mb-4 mt-2">
                  <step.icon className="w-7 h-7 text-pink-500 dark:text-pink-400" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {step.description}
                </p>

                {/* Duration badge */}
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                  {step.duration}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
