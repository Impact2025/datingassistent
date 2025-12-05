'use client';

/**
 * KickstartCursusRecommendations Component
 *
 * Wereldklasse cursus-aanbevelingen binnen het Kickstart programma.
 * Toont relevante cursussen gebaseerd op de huidige dag en voortgang.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  ChevronRight,
  Clock,
  Gift,
  GraduationCap,
  Lock,
  Play,
  Sparkles,
  Star,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CursusRecommendation {
  cursusSlug: string;
  lesSlug?: string;
  type: 'deepDive' | 'bonus' | 'nextStep' | 'tool';
  title: string;
  description: string;
  isPremium: boolean;
  discount?: number;
  cursusData?: {
    id: number;
    titel: string;
    beschrijving: string;
    prijs: number;
    discountedPrijs?: number;
    thumbnail_url?: string;
    duur_minuten?: number;
    totaal_lessen: number;
  };
  lesData?: {
    id: number;
    titel: string;
    beschrijving?: string;
    duur_minuten?: number;
  };
  userProgress?: {
    hasAccess: boolean;
    isCompleted: boolean;
    progressPercentage: number;
  };
}

interface WeekRecommendation {
  weekNumber: 1 | 2 | 3;
  title: string;
  description: string;
  completionBonus: {
    cursusSlug: string;
    title: string;
    type: 'unlock' | 'discount';
    value?: number;
  };
  enrichedCursussen: CursusRecommendation[];
}

interface Props {
  dayNumber: number;
  compact?: boolean;
  showWeekBonus?: boolean;
  className?: string;
}

const typeIcons = {
  deepDive: BookOpen,
  bonus: Gift,
  nextStep: Zap,
  tool: Sparkles,
};

const typeLabels = {
  deepDive: 'Verdieping',
  bonus: 'Bonus',
  nextStep: 'Volgende Stap',
  tool: 'AI Tool',
};

const typeColors = {
  deepDive: 'from-blue-500 to-blue-600',
  bonus: 'from-purple-500 to-purple-600',
  nextStep: 'from-pink-500 to-pink-600',
  tool: 'from-emerald-500 to-emerald-600',
};

export function KickstartCursusRecommendations({
  dayNumber,
  compact = false,
  showWeekBonus = true,
  className,
}: Props) {
  const [recommendations, setRecommendations] = useState<CursusRecommendation[]>([]);
  const [weekRecommendation, setWeekRecommendation] = useState<WeekRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);

  useEffect(() => {
    fetchRecommendations();
  }, [dayNumber]);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`/api/kickstart/recommendations?day=${dayNumber}`);
      if (!res.ok) return;

      const data = await res.json();
      setRecommendations(data.dayRecommendations || []);
      if (showWeekBonus && data.weekRecommendation) {
        setWeekRecommendation(data.weekRecommendation);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0 && !weekRecommendation) {
    return null; // Geen aanbevelingen voor deze dag
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Week Bonus Banner */}
      {weekRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 p-6 text-white shadow-lg"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('/images/confetti-pattern.svg')] opacity-10"></div>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <div>
                <h3 className="text-xl font-bold">{weekRecommendation.title}</h3>
                <p className="text-pink-100 text-sm">{weekRecommendation.description}</p>
              </div>
            </div>

            {/* Completion Bonus */}
            <div className="bg-white/20 rounded-lg p-4 mt-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                {weekRecommendation.completionBonus.type === 'unlock' ? (
                  <Unlock className="h-5 w-5 text-yellow-300" />
                ) : (
                  <Star className="h-5 w-5 text-yellow-300" />
                )}
                <span className="font-semibold text-yellow-100">
                  {weekRecommendation.completionBonus.title}
                </span>
              </div>
              {weekRecommendation.completionBonus.value && (
                <Badge className="bg-yellow-400 text-yellow-900 font-bold">
                  {weekRecommendation.completionBonus.value}% Korting
                </Badge>
              )}
            </div>

            {/* Quick access to cursussen */}
            {weekRecommendation.enrichedCursussen.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {weekRecommendation.enrichedCursussen.slice(0, 2).map((rec) => (
                  <Link
                    key={rec.cursusSlug}
                    href={`/cursussen/${rec.cursusSlug}${rec.lesSlug ? `/${rec.lesSlug}` : ''}`}
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    {rec.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Day Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/20 dark:to-background">
          <CardHeader
            className={cn(
              'cursor-pointer transition-colors hover:bg-pink-50/50 dark:hover:bg-pink-950/30',
              compact && 'pb-2'
            )}
            onClick={() => compact && setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-pink-600" />
                <span>Dieper Leren</span>
                {recommendations.some(r => !r.isPremium) && (
                  <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                    Gratis beschikbaar
                  </Badge>
                )}
              </CardTitle>
              {compact && (
                <ChevronRight
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform',
                    expanded && 'rotate-90'
                  )}
                />
              )}
            </div>
            {!compact && (
              <p className="text-sm text-muted-foreground mt-1">
                Verdiep je kennis met deze cursussen die aansluiten bij vandaag
              </p>
            )}
          </CardHeader>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="space-y-3 pt-0">
                  {recommendations.map((rec, index) => (
                    <RecommendationCard key={`${rec.cursusSlug}-${index}`} recommendation={rec} />
                  ))}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: CursusRecommendation }) {
  const Icon = typeIcons[recommendation.type];
  const label = typeLabels[recommendation.type];
  const colorClass = typeColors[recommendation.type];

  const hasAccess = recommendation.userProgress?.hasAccess ?? false;
  const isCompleted = recommendation.userProgress?.isCompleted ?? false;
  const progress = recommendation.userProgress?.progressPercentage ?? 0;

  const href = `/cursussen/${recommendation.cursusSlug}${
    recommendation.lesSlug ? `/${recommendation.lesSlug}` : ''
  }`;

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'group relative overflow-hidden rounded-lg border p-4 transition-all',
          'hover:border-pink-300 hover:shadow-md',
          isCompleted && 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20',
          !hasAccess && 'opacity-80'
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon Badge */}
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
              colorClass
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground group-hover:text-pink-600 transition-colors">
                    {recommendation.lesData?.titel || recommendation.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                  {isCompleted && (
                    <Badge className="bg-emerald-500 text-white text-xs">
                      Voltooid
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {recommendation.lesData?.beschrijving || recommendation.description}
                </p>
              </div>

              {/* Lock/Access indicator */}
              {!hasAccess && (
                <div className="shrink-0">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {recommendation.lesData?.duur_minuten && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {recommendation.lesData.duur_minuten} min
                </span>
              )}
              {recommendation.cursusData && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {recommendation.cursusData.totaal_lessen} lessen
                </span>
              )}
              {recommendation.discount && !hasAccess && (
                <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200">
                  {recommendation.discount}% Kickstart korting
                </Badge>
              )}
            </div>

            {/* Progress bar */}
            {progress > 0 && !isCompleted && (
              <div className="mt-2">
                <Progress value={progress} className="h-1.5" />
                <span className="text-xs text-muted-foreground mt-1">{progress}% voltooid</span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Price display for premium content */}
        {recommendation.isPremium && recommendation.cursusData && !hasAccess && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              {recommendation.cursusData.discountedPrijs ? (
                <>
                  <span className="text-lg font-bold text-pink-600">
                    €{recommendation.cursusData.discountedPrijs}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    €{recommendation.cursusData.prijs}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-foreground">
                  €{recommendation.cursusData.prijs}
                </span>
              )}
            </div>
            <Button size="sm" className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700">
              Bekijk cursus
            </Button>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
