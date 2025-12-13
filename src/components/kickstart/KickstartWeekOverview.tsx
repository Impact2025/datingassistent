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
    icon: Camera,
  },
  {
    week: 2,
    title: 'Bio & Profiel',
    subtitle: 'Vertel je verhaal',
    icon: Pencil,
  },
  {
    week: 3,
    title: 'Gesprekken & Connectie',
    subtitle: 'Master je communicatie',
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
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">21 Dagen Kickstart</h2>
          <p className="text-gray-500 mt-0.5">
            Dag {stats.completedDays} van {stats.totalDays}
          </p>
        </div>

        {onBack && (
          <Button variant="outline" onClick={onBack} className="border-gray-200 text-gray-700">
            Terug
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Voortgang</span>
            <span className="text-sm font-medium text-gray-900">{stats.progressPercentage}%</span>
          </div>
          <Progress value={stats.progressPercentage} className="h-1.5 bg-gray-100" />
        </CardContent>
      </Card>

      {/* Weeks */}
      <div className="space-y-4">
        {weekGroups.map((week) => {
          const isExpanded = expandedWeeks.has(week.week);
          const WeekIcon = week.icon;

          return (
            <Card key={week.week} className="overflow-hidden border-gray-200">
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.week)}
                className={cn(
                  'w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left',
                  week.hasAvailable && 'bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    week.progress === 100 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {week.progress === 100 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <WeekIcon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900">Week {week.week}</span>
                    {week.hasAvailable && (
                      <span className="text-xs text-gray-500">Actief</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{week.title}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{week.progress}%</span>
                    <p className="text-xs text-gray-400">{week.completedCount}/7</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
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
                            'p-4 rounded-lg text-left transition-all border',
                            // Completed
                            isCompleted && 'bg-gray-50 border-gray-900 hover:bg-gray-100',
                            // Active/Available
                            isActive && 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800',
                            // Locked
                            isLocked && 'bg-white border-gray-200 opacity-40 cursor-not-allowed',
                            // Default
                            !isCompleted && !isActive && !isLocked && 'bg-white border-gray-200 hover:border-gray-300'
                          )}
                          whileHover={!isLocked ? { scale: 1.01 } : {}}
                          whileTap={!isLocked ? { scale: 0.99 } : {}}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                              isActive ? 'bg-white/20' : isCompleted ? 'bg-gray-900' : 'bg-gray-100'
                            )}>
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <Play className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-gray-600')} />
                              )}
                            </div>
                            <div className={cn(
                              'text-xs font-medium',
                              isActive ? 'text-white/70' : 'text-gray-500'
                            )}>
                              Dag {day.dag_nummer}
                            </div>
                          </div>

                          <div className={cn(
                            'text-sm font-medium line-clamp-2',
                            isActive ? 'text-white' : isLocked ? 'text-gray-400' : 'text-gray-900'
                          )}>
                            {day.titel}
                          </div>

                          {day.ai_tool && !isLocked && (
                            <div className={cn(
                              'mt-2 text-xs font-medium flex items-center gap-1',
                              isActive ? 'text-white/70' : 'text-gray-500'
                            )}>
                              AI Tool
                            </div>
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
