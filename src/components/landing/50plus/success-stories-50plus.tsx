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
    quote: "Na het overlijden van mijn man dacht ik dat ik te oud was. De emotionele ready scan gaf me inzicht dat ik wel klaar was voor gezelschap. Nu, 8 maanden later, heb ik iemand gevonden die mijn levenservaring waardeert.",
    name: 'Maria',
    age: 59,
    situation: 'Weduwe, 3 jaar alleen',
    program: 'Transformatie',
    timeToSuccess: '8 maanden',
  },
  {
    quote: "Als ondernemer waardeer ik mijn privacy enorm. Het profiel werd zo gemaakt dat niemand van mijn netwerk me herkent, maar ik wel interessante matches krijg. Discrete én effectief.",
    name: 'Jan',
    age: 54,
    situation: 'Gescheiden, ondernemer',
    program: 'VIP Reis',
    timeToSuccess: '3 maanden',
  },
  {
    quote: "Leerde patronen doorbreken die ik 30 jaar heb herhaald. Op 63 voel ik me zekerder dan ooit. Ik date nu vanuit keuze, niet uit eenzaamheid. Dat maakt alle verschil.",
    name: 'Els',
    age: 63,
    situation: 'Gescheiden, kleinkinderen',
    program: 'Transformatie',
    timeToSuccess: '5 maanden',
  },
];

export function SuccessStories50Plus() {
  return (
    <section className="py-20 px-4" style={{ backgroundColor: colors.softBlush }}>
      <div className="max-w-6xl mx-auto">
        {/* AggregateRating Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: 'DatingAssistent voor 50-plussers',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                bestRating: '5',
                worstRating: '1',
                ratingCount: '89',
              },
              review: stories.map(story => ({
                '@type': 'Review',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                  bestRating: '5',
                },
                author: {
                  '@type': 'Person',
                  name: story.name,
                  age: story.age.toString(),
                },
                reviewBody: story.quote,
                datePublished: '2026-02-15',
              })),
            }),
          }}
        />

        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Zij durfden opnieuw te beginnen
          </h2>
          <p className="text-lg" style={{ color: colors.mediumGray }}>
            Echte verhalen van 50-plussers die kozen voor een nieuw hoofdstuk
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
              35% van onze leden is 50+
            </span>
            <br />
            Jouw levensfase is geen uitzondering - het is de norm
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default SuccessStories50Plus;
