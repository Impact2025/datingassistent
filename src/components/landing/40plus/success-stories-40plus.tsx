'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const colors = {
  deepPurple: 'var(--color-deep-purple, #722F37)',
  dustyRose: 'var(--color-dusty-rose, #E3867D)',
  softBlush: 'var(--color-soft-blush, #F5E6E8)',
  warmCoral: 'var(--color-warm-coral, #FF7B54)',
  charcoal: 'var(--color-charcoal, #2D3142)',
  mediumGray: 'var(--color-medium-gray, #6B6B6B)',
};

const stories = [
  {
    quote: "Na 18 jaar huwelijk had ik geen idee hoe te daten. De Emotionele Ready Scan hielp me eerst helen. 6 maanden later ontmoette ik Mark - een man die écht luistert. Ik had nooit gedacht dat ik dit opnieuw zou voelen.",
    name: 'Sophie',
    age: 46,
    situation: 'Gescheiden, 2 kinderen',
    program: 'Transformatie',
    timeToSuccess: '6 maanden',
  },
  {
    quote: "Bang dat niemand interesse had in een 52-jarige vader met een drukke baan. Het profiel werd geoptimaliseerd zonder mijn privacy te schenden. Eerste date binnen 2 weken. Nu al 4 maanden samen en ze heeft mijn kinderen ontmoet.",
    name: 'Robert',
    age: 52,
    situation: 'Weduwnaar, 1 jaar alleen',
    program: 'Kickstart',
    timeToSuccess: '2 weken',
  },
  {
    quote: "Leerde patronen herkennen die ik mijn hele leven heb herhaald - altijd emotioneel onbeschikbare partners. Eindelijk kies ik mannen die écht beschikbaar zijn. Op 58 voel ik me zekerder dan ooit.",
    name: 'Linda',
    age: 58,
    situation: 'Nooit getrouwd',
    program: 'VIP Reis',
    timeToSuccess: '3 maanden',
  },
];

export function SuccessStories40Plus() {
  return (
    <section className="py-20 px-4" style={{ backgroundColor: colors.softBlush }}>
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
            Zij Begonnen Ook Opnieuw
          </h2>
          <p className="text-lg" style={{ color: colors.mediumGray }}>
            Echte verhalen van 40-plussers die de stap durfden te zetten
          </p>
        </motion.div>

        {/* Stories grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((story, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-8 bg-white border-2 relative overflow-hidden"
              style={{ borderColor: colors.dustyRose }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            >
              {/* Quote icon decoration */}
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="w-16 h-16" style={{ color: colors.dustyRose }} />
              </div>

              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mb-6 relative z-10">
                <p className="text-base italic leading-relaxed" style={{ color: colors.charcoal }}>
                  "{story.quote}"
                </p>
              </blockquote>

              {/* Author info */}
              <div className="border-t-2 pt-4" style={{ borderColor: colors.softBlush }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg" style={{ color: colors.deepPurple }}>
                      {story.name}, {story.age}
                    </p>
                    <p className="text-sm" style={{ color: colors.mediumGray }}>
                      {story.situation}
                    </p>
                  </div>
                </div>

                {/* Program and time badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: `${colors.dustyRose}20`,
                      color: colors.deepPurple,
                      border: 'none',
                    }}
                  >
                    {story.program}
                  </Badge>
                  <Badge
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: `${colors.warmCoral}20`,
                      color: colors.charcoal,
                      border: 'none',
                    }}
                  >
                    ⏱ {story.timeToSuccess}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom reassurance */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg" style={{ color: colors.charcoal }}>
            <span className="font-semibold" style={{ color: colors.deepPurple }}>
              Gemiddelde leeftijd van onze leden: 42 jaar
            </span>
            <br />
            Je bent niet alleen - en het is niet te laat
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default SuccessStories40Plus;
