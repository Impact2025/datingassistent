'use client';

/**
 * WeekSidebar - Navigatiepaneel voor Kickstart 21-dagen programma
 * Toont 3 weken met 7 dagen elk, met visuele progress indicatie
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Lock,
  ChevronDown,
  ChevronRight,
  Play,
  Sparkles,
  Camera,
  Pencil,
  MessageCircle,
  Heart,
  User,
  Zap,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Week themes - all with pink accent to match dashboard style
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

// Day types with their styling - all pink to match dashboard
const DAY_TYPE_STYLES: Record<string, { icon: typeof Play; color: string }> = {
  video: { icon: Play, color: 'text-pink-500' },
  quiz: { icon: Target, color: 'text-pink-500' },
  actie: { icon: Zap, color: 'text-pink-500' },
  reflectie: { icon: Heart, color: 'text-pink-500' },
  ai_tool: { icon: Sparkles, color: 'text-pink-500' },
};

export interface DaySummary {
  dag_nummer: number;
  titel: string;
  dag_type: string;
  status: 'completed' | 'available' | 'in_progress' | 'locked';
  emoji?: string;
  ai_tool?: string | null;
}

interface WeekSidebarProps {
  days: DaySummary[];
  currentDay: number;
  onSelectDay: (dayNumber: number) => void;
  className?: string;
}

export function WeekSidebar({ days, currentDay, onSelectDay, className }: WeekSidebarProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(() => {
    // Auto-expand the week containing the current day
    const currentWeek = Math.ceil(currentDay / 7);
    return new Set([currentWeek]);
  });

  // Group days by week
  const weekGroups = WEEK_THEMES.map((weekTheme) => {
    const startDay = (weekTheme.week - 1) * 7 + 1;
    const endDay = weekTheme.week * 7;
    const weekDays = days.filter(
      (d) => d.dag_nummer >= startDay && d.dag_nummer <= endDay
    );

    const completedCount = weekDays.filter((d) => d.status === 'completed').length;
    const progress = Math.round((completedCount / 7) * 100);
    const isCurrentWeek = currentDay >= startDay && currentDay <= endDay;

    return {
      ...weekTheme,
      days: weekDays,
      completedCount,
      progress,
      isCurrentWeek,
    };
  });

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

  const getStatusIcon = (status: string, isSelected: boolean) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'available':
        return isSelected ? (
          <Circle className="w-4 h-4 text-pink-500 fill-pink-100" />
        ) : (
          <Circle className="w-4 h-4 text-gray-400" />
        );
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-300" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div
      className={cn(
        'w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-pink-100">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-gray-900">21 Dagen Kickstart</h2>
        </div>
        <p className="text-sm text-gray-600">
          Dag {currentDay} van 21 · {days.filter((d) => d.status === 'completed').length} voltooid
        </p>
      </div>

      {/* Weeks */}
      <div className="divide-y divide-gray-100">
        {weekGroups.map((week) => {
          const isExpanded = expandedWeeks.has(week.week);
          const WeekIcon = week.icon;

          return (
            <div key={week.week}>
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.week)}
                className={cn(
                  'w-full p-4 flex items-center gap-3 hover:bg-pink-50/50 transition-colors',
                  week.isCurrentWeek && 'bg-gradient-to-r from-pink-50 to-rose-50'
                )}
              >
                {/* Week Icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    week.progress === 100
                      ? 'bg-green-100'
                      : 'bg-pink-100'
                  )}
                >
                  {week.progress === 100 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <span className="text-lg">{week.emoji}</span>
                  )}
                </div>

                {/* Week Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      Week {week.week}
                    </span>
                    {week.isCurrentWeek && (
                      <Badge className="bg-pink-500 text-white text-xs">
                        Actief
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{week.title}</p>
                </div>

                {/* Progress & Chevron */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-medium text-pink-600">
                      {week.progress}%
                    </span>
                    <p className="text-xs text-gray-500">
                      {week.completedCount}/7
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-pink-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-pink-400" />
                  )}
                </div>
              </button>

              {/* Week Progress Bar */}
              {!isExpanded && (
                <div className="px-4 pb-3">
                  <Progress value={week.progress} className="h-1.5" />
                </div>
              )}

              {/* Days List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      {week.days.map((day) => {
                        const isSelected = day.dag_nummer === currentDay;
                        const isLocked = day.status === 'locked';
                        const isCompleted = day.status === 'completed';
                        const DayTypeIcon =
                          DAY_TYPE_STYLES[day.dag_type]?.icon || Play;

                        return (
                          <motion.button
                            key={day.dag_nummer}
                            onClick={() => !isLocked && onSelectDay(day.dag_nummer)}
                            disabled={isLocked}
                            className={cn(
                              'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                              // Selected state - prominent pink
                              isSelected && 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200',
                              // Completed state - soft green
                              !isSelected && isCompleted && 'bg-green-50 border border-green-200 hover:border-green-300',
                              // Available state - pink outline
                              !isSelected && !isCompleted && !isLocked && 'bg-white border border-pink-200 hover:border-pink-400 hover:bg-pink-50/50',
                              // Locked state
                              isLocked && 'bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed'
                            )}
                            whileHover={!isLocked ? { scale: 1.02 } : {}}
                            whileTap={!isLocked ? { scale: 0.98 } : {}}
                          >
                            {/* Status Icon */}
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                              isSelected ? 'bg-white/20' : isCompleted ? 'bg-green-100' : isLocked ? 'bg-gray-100' : 'bg-pink-100'
                            )}>
                              {isCompleted ? (
                                <CheckCircle className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-green-600')} />
                              ) : isLocked ? (
                                <Lock className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Play className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-pink-500')} />
                              )}
                            </div>

                            {/* Day Info */}
                            <div className="flex-1 min-w-0">
                              <span
                                className={cn(
                                  'text-sm font-semibold block truncate',
                                  isSelected ? 'text-white' : isLocked ? 'text-gray-400' : 'text-gray-900'
                                )}
                              >
                                Dag {day.dag_nummer}: {day.titel}
                              </span>

                              {/* Day Type Badge */}
                              <div className="flex items-center gap-1.5 mt-1">
                                <DayTypeIcon
                                  className={cn('w-3 h-3', isSelected ? 'text-white/80' : 'text-pink-400')}
                                />
                                <span className={cn(
                                  'text-xs capitalize',
                                  isSelected ? 'text-white/80' : 'text-gray-500'
                                )}>
                                  {day.dag_type}
                                </span>
                                {day.ai_tool && (
                                  <Badge
                                    className={cn(
                                      'text-xs px-1.5 py-0',
                                      isSelected ? 'bg-white/20 text-white border-0' : 'bg-pink-100 text-pink-600 border-0'
                                    )}
                                  >
                                    <Sparkles className="w-3 h-3 mr-0.5" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Emoji */}
                            {day.emoji && !isLocked && (
                              <span className="text-lg flex-shrink-0">{day.emoji}</span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Totale voortgang</span>
          <span className="font-semibold text-pink-600">
            {Math.round((days.filter((d) => d.status === 'completed').length / 21) * 100)}%
          </span>
        </div>
        <Progress
          value={(days.filter((d) => d.status === 'completed').length / 21) * 100}
          className="h-2 mt-2"
        />
      </div>
    </div>
  );
}
