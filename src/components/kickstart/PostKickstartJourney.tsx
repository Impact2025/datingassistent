'use client';

/**
 * PostKickstartJourney Component
 *
 * Gepersonaliseerde next-step aanbevelingen voor gebruikers die
 * het Kickstart 21-dagen programma hebben voltooid.
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Gift,
  GraduationCap,
  Heart,
  MessageCircle,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyScenario {
  id: 'still_dating' | 'found_match' | 'in_relationship';
  emoji: string;
  title: string;
  description: string;
  color: string;
}

interface CursusRecommendation {
  slug: string;
  title: string;
  description: string;
  discount: number;
  type: 'primary' | 'secondary';
}

interface Props {
  userName?: string;
  completedDays: number;
  className?: string;
}

const scenarios: JourneyScenario[] = [
  {
    id: 'still_dating',
    emoji: '🔍',
    title: 'Ik ben nog aan het daten',
    description: 'Ik wil meer matches en betere gesprekken',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'found_match',
    emoji: '💫',
    title: 'Ik heb iemand ontmoet!',
    description: 'Het gaat goed, ik wil het goed doen',
    color: 'from-coral-500 to-rose-600',
  },
  {
    id: 'in_relationship',
    emoji: '💑',
    title: 'Ik ben in een relatie',
    description: 'Ik wil deze relatie laten slagen',
    color: 'from-purple-500 to-violet-600',
  },
];

const recommendationsByScenario: Record<'still_dating' | 'found_match' | 'in_relationship', CursusRecommendation[]> = {
  still_dating: [
    {
      slug: 'dating-fundament-pro',
      title: 'Dating Fundament PRO',
      description: 'Alle 23 lessen voor diepgaand begrip van online dating. Perfect als verdieping op je Kickstart kennis.',
      discount: 30,
      type: 'primary',
    },
    {
      slug: 'red-flags-5',
      title: 'Herken de 5 Red Flags',
      description: 'Bescherm jezelf terwijl je actief date. Herken manipulatief gedrag vroeg.',
      discount: 20,
      type: 'secondary',
    },
  ],
  found_match: [
    {
      slug: 'red-flags-5',
      title: 'Herken de 5 Red Flags',
      description: 'Zorg dat je de juiste persoon hebt gevonden. Check of er geen rode vlaggen zijn.',
      discount: 25,
      type: 'primary',
    },
    {
      slug: 'meesterschap-in-relaties',
      title: 'Meesterschap in Relaties',
      description: 'Leer hoe je deze connectie kunt laten groeien naar een duurzame relatie.',
      discount: 30,
      type: 'secondary',
    },
  ],
  in_relationship: [
    {
      slug: 'meesterschap-in-relaties',
      title: 'Meesterschap in Relaties',
      description: 'De complete transformatie naar een duurzame, vervullende relatie. 29 lessen over communicatie, conflicthantering en groei.',
      discount: 30,
      type: 'primary',
    },
  ],
};

export function PostKickstartJourney({ userName, completedDays, className }: Props) {
  const [selectedScenario, setSelectedScenario] = useState<'still_dating' | 'found_match' | 'in_relationship' | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleScenarioSelect = (scenarioId: 'still_dating' | 'found_match' | 'in_relationship') => {
    setSelectedScenario(scenarioId);
    setTimeout(() => setShowRecommendations(true), 300);
  };

  const recommendations = selectedScenario ? recommendationsByScenario[selectedScenario] : [];

  if (completedDays < 21) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-8 text-white shadow-xl"
      >
        {/* Confetti decoration */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#fff', '#ffd700', '#ff69b4', '#00ff00', '#ff4500'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
          >
            <Trophy className="w-10 h-10 text-yellow-200" />
          </motion.div>

          <h2 className="text-3xl font-bold mb-2">
            Gefeliciteerd{userName ? `, ${userName}` : ''}!
          </h2>
          <p className="text-xl text-amber-100 mb-4">
            Je hebt alle 21 dagen voltooid!
          </p>

          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Star className="w-5 h-5 text-yellow-200" />
            <span className="font-semibold">Kickstart Graduate</span>
            <Badge className="bg-yellow-400 text-yellow-900">30% Korting</Badge>
          </div>
        </div>
      </motion.div>

      {/* Scenario Selection */}
      {!selectedScenario && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Wat is je huidige situatie?</CardTitle>
              <p className="text-sm text-muted-foreground">
                Kies wat het beste bij je past, zodat we je de juiste volgende stap kunnen aanbevelen
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {scenarios.map((scenario, index) => (
                <motion.button
                  key={scenario.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className={cn(
                    'w-full group relative overflow-hidden rounded-xl p-4 text-left transition-all',
                    'hover:shadow-lg hover:scale-[1.02]',
                    'border-2 border-transparent hover:border-coral-200',
                    'bg-gradient-to-r',
                    scenario.color
                  )}
                >
                  <div className="flex items-center gap-4 text-white">
                    <span className="text-3xl">{scenario.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{scenario.title}</h3>
                      <p className="text-sm text-white/80">{scenario.description}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      <AnimatePresence>
        {showRecommendations && selectedScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedScenario(null);
                setShowRecommendations(false);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Andere situatie kiezen
            </Button>

            {/* Selected scenario recap */}
            <Card className="border-coral-200 bg-gradient-to-r from-coral-50 to-rose-50 dark:from-coral-950/20 dark:to-rose-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {scenarios.find(s => s.id === selectedScenario)?.emoji}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {scenarios.find(s => s.id === selectedScenario)?.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dit zijn je aanbevolen volgende stappen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course recommendations */}
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/cursussen/${rec.slug}`}>
                  <Card
                    className={cn(
                      'group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1',
                      rec.type === 'primary'
                        ? 'border-2 border-coral-300 bg-gradient-to-br from-coral-50 to-white dark:from-coral-950/30 dark:to-background'
                        : 'border-gray-200 hover:border-coral-200'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm',
                            rec.type === 'primary'
                              ? 'bg-gradient-to-br from-coral-500 to-rose-600 text-white'
                              : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                          )}
                        >
                          {rec.type === 'primary' ? (
                            <GraduationCap className="h-6 w-6" />
                          ) : (
                            <BookOpen className="h-6 w-6" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg group-hover:text-coral-600 transition-colors">
                                  {rec.title}
                                </h3>
                                {rec.type === 'primary' && (
                                  <Badge className="bg-coral-100 text-coral-700">
                                    Aanbevolen
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 shrink-0 font-bold">
                              {rec.discount}% korting
                            </Badge>
                          </div>

                          <p className="text-muted-foreground mb-4">
                            {rec.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-4 w-4" />
                                Kickstart Graduate korting
                              </span>
                            </div>

                            <Button
                              size="sm"
                              className={cn(
                                rec.type === 'primary'
                                  ? 'bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700'
                                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
                              )}
                            >
                              Bekijk cursus
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {/* Additional options */}
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <MessageCircle className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Niet zeker welke past?</h4>
                    <p className="text-sm text-muted-foreground">
                      Vraag Iris om persoonlijk advies gebaseerd op jouw situatie
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Chat met Iris
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
