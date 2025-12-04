'use client';

/**
 * KickstartWeekOverview - Simpele week navigatie voor dashboard
 * Toont 3 weken met dag-knoppen, elke dag linkt naar eigen pagina
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Lock,
  Play,
  Sparkles,
  Camera,
  Pencil,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DaySummary {
  dag_nummer: number;
  titel: string;
  dag_type: string;
  status: 'completed' | 'available' | 'in_progress' | 'locked';
  emoji?: string;
  ai_tool?: string | null;
}

interface KickstartWeekOverviewProps {
  onBack?: () => void;
}

const WEEK_THEMES = [
  {
    week: 1,
    title: "Foto's & Eerste Indruk",
    subtitle: 'Bouw je visuele fundament',
    emoji: '📸',
    icon: Camera,
  },
  {
    week: 2,
    title: 'Bio & Profiel',
    subtitle: 'Vertel je verhaal',
    emoji: '✍️',
    icon: Pencil,
  },
  {
    week: 3,
    title: 'Gesprekken & Connectie',
    subtitle: 'Master je communicatie',
    emoji: '💬',
    icon: MessageCircle,
  },
];

export function KickstartWeekOverview({ onBack }: KickstartWeekOverviewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DaySummary[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [stats, setStats] = useState({ completedDays: 0, totalDays: 21, progressPercentage: 0 });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/kickstart/progress');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.days) {
            setDays(data.days);
            if (data.stats) {
              setStats(data.stats);
            }

            // Auto-expand week with current progress
            const currentDay = data.days.find(
              (d: DaySummary) => d.status === 'available' || d.status === 'in_progress'
            );
            if (currentDay) {
              const currentWeek = Math.ceil(currentDay.dag_nummer / 7);
              setExpandedWeeks(new Set([currentWeek]));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
  };

  const handleDayClick = (dayNumber: number, status: string) => {
    if (status === 'locked') return;
    router.push(`/kickstart/dag/${dayNumber}`);
  };

  // Group days by week
  const weekGroups = WEEK_THEMES.map((weekTheme) => {
    const startDay = (weekTheme.week - 1) * 7 + 1;
    const endDay = weekTheme.week * 7;
    const weekDays = days.filter(
      (d) => d.dag_nummer >= startDay && d.dag_nummer <= endDay
    );

    const completedCount = weekDays.filter((d) => d.status === 'completed').length;
    const progress = weekDays.length > 0 ? Math.round((completedCount / weekDays.length) * 100) : 0;

    const hasAvailable = weekDays.some(d => d.status === 'available' || d.status === 'in_progress');

    return {
      ...weekTheme,
      days: weekDays,
      completedCount,
      progress,
      hasAvailable,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">21 Dagen Kickstart</h2>
            <p className="text-gray-600">
              {stats.completedDays} van {stats.totalDays} dagen voltooid
            </p>
          </div>
        </div>

        {onBack && (
          <Button variant="outline" onClick={onBack} className="border-pink-200 text-pink-600">
            Dating Reis
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      <Card className="border-pink-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Totale voortgang</span>
            <span className="text-sm font-semibold text-pink-600">{stats.progressPercentage}%</span>
          </div>
          <Progress value={stats.progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Weeks */}
      <div className="space-y-4">
        {weekGroups.map((week) => {
          const isExpanded = expandedWeeks.has(week.week);
          const WeekIcon = week.icon;

          return (
            <Card key={week.week} className="overflow-hidden border-pink-100">
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.week)}
                className={cn(
                  'w-full p-4 flex items-center gap-4 hover:bg-pink-50/50 transition-colors text-left',
                  week.hasAvailable && 'bg-gradient-to-r from-pink-50 to-rose-50'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    week.progress === 100 ? 'bg-green-100' : 'bg-pink-100'
                  )}
                >
                  {week.progress === 100 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <span className="text-2xl">{week.emoji}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">Week {week.week}</span>
                    {week.hasAvailable && (
                      <Badge className="bg-pink-500 text-white text-xs">Actief</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{week.title}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-semibold text-pink-600">{week.progress}%</span>
                    <p className="text-xs text-gray-500">{week.completedCount}/7</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-pink-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-pink-400" />
                  )}
                </div>
              </button>

              {/* Week Progress (collapsed) */}
              {!isExpanded && (
                <div className="px-4 pb-3">
                  <Progress value={week.progress} className="h-1.5" />
                </div>
              )}

              {/* Days Grid (expanded) */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {week.days.map((day) => {
                      const isLocked = day.status === 'locked';
                      const isCompleted = day.status === 'completed';
                      const isActive = day.status === 'available' || day.status === 'in_progress';

                      return (
                        <motion.button
                          key={day.dag_nummer}
                          onClick={() => handleDayClick(day.dag_nummer, day.status)}
                          disabled={isLocked}
                          className={cn(
                            'p-4 rounded-xl text-left transition-all',
                            // Completed
                            isCompleted && 'bg-green-50 border-2 border-green-200 hover:border-green-300',
                            // Active/Available
                            isActive && 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 hover:shadow-xl',
                            // Locked
                            isLocked && 'bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed',
                            // Default (shouldn't happen)
                            !isCompleted && !isActive && !isLocked && 'bg-white border border-pink-200 hover:border-pink-400'
                          )}
                          whileHover={!isLocked ? { scale: 1.02 } : {}}
                          whileTap={!isLocked ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              isActive ? 'bg-white/20' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                            )}>
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : isLocked ? (
                                <Lock className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Play className={cn('w-4 h-4', isActive ? 'text-white' : 'text-pink-500')} />
                              )}
                            </div>
                            {day.emoji && !isLocked && (
                              <span className="text-lg">{day.emoji}</span>
                            )}
                          </div>

                          <div className={cn(
                            'text-xs font-medium mb-1',
                            isActive ? 'text-white/80' : 'text-gray-500'
                          )}>
                            Dag {day.dag_nummer}
                          </div>

                          <div className={cn(
                            'text-sm font-semibold line-clamp-2',
                            isActive ? 'text-white' : isLocked ? 'text-gray-400' : 'text-gray-900'
                          )}>
                            {day.titel}
                          </div>

                          {day.ai_tool && !isLocked && (
                            <Badge className={cn(
                              'mt-2 text-xs',
                              isActive ? 'bg-white/20 text-white border-0' : 'bg-pink-100 text-pink-600 border-0'
                            )}>
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
