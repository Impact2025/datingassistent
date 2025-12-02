'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Lock,
  Play,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { ProgramWeek, ProgramDay, DayProgress } from '@/types/kickstart.types';

interface WeekOverviewProps {
  weeks: ProgramWeek[];
  currentDay: number;
  completedDays: number[];
  onDaySelect: (dayNumber: number) => void;
}

export function WeekOverview({
  weeks,
  currentDay,
  completedDays,
  onDaySelect,
}: WeekOverviewProps) {
  const getDayStatus = (dayNumber: number) => {
    if (completedDays.includes(dayNumber)) return 'completed';
    if (dayNumber === 1) return 'available';
    if (completedDays.includes(dayNumber - 1)) return 'available';
    return 'locked';
  };

  return (
    <div className="space-y-6">
      {weeks.map((week, weekIndex) => (
        <motion.div
          key={week.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: weekIndex * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{week.emoji}</span>
                  <div>
                    <CardTitle className="text-lg">
                      Week {week.week_nummer}: {week.titel}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{week.thema}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Target className="w-4 h-4" />
                    <span>{week.kpi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={week.progress?.percentage || 0}
                      className="w-24 h-2"
                    />
                    <span className="text-sm font-medium">
                      {week.progress?.percentage || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {week.days?.map((day) => {
                  const status = getDayStatus(day.dag_nummer);
                  const isCurrentDay = day.dag_nummer === currentDay;

                  return (
                    <DayCard
                      key={day.id}
                      day={day}
                      status={status}
                      isCurrentDay={isCurrentDay}
                      onClick={() =>
                        status !== 'locked' && onDaySelect(day.dag_nummer)
                      }
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

interface DayCardProps {
  day: ProgramDay;
  status: 'locked' | 'available' | 'completed';
  isCurrentDay: boolean;
  onClick: () => void;
}

function DayCard({ day, status, isCurrentDay, onClick }: DayCardProps) {
  const statusStyles = {
    locked: 'bg-gray-100 text-gray-400 cursor-not-allowed',
    available: 'bg-white border-pink-300 hover:border-pink-500 hover:shadow-md cursor-pointer',
    completed: 'bg-green-50 border-green-300 cursor-pointer',
  };

  const StatusIcon = {
    locked: Lock,
    available: isCurrentDay ? Play : Circle,
    completed: CheckCircle,
  }[status];

  return (
    <motion.button
      whileHover={status !== 'locked' ? { scale: 1.02 } : {}}
      whileTap={status !== 'locked' ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={status === 'locked'}
      className={`
        relative p-3 rounded-xl border-2 transition-all
        ${statusStyles[status]}
        ${isCurrentDay ? 'ring-2 ring-pink-500 ring-offset-2' : ''}
      `}
    >
      {/* Day number */}
      <div className="text-xs font-medium text-gray-500 mb-1">
        Dag {day.dag_nummer}
      </div>

      {/* Emoji */}
      <div className="text-2xl mb-1">{day.emoji}</div>

      {/* Title (truncated) */}
      <div className="text-xs font-medium line-clamp-2 min-h-[2rem]">
        {day.titel}
      </div>

      {/* Duration */}
      <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-1">
        <Clock className="w-3 h-3" />
        {day.duur_minuten}m
      </div>

      {/* Status icon */}
      <div className="absolute top-2 right-2">
        <StatusIcon
          className={`w-4 h-4 ${
            status === 'completed'
              ? 'text-green-500'
              : status === 'available'
                ? 'text-pink-500'
                : 'text-gray-300'
          }`}
        />
      </div>

      {/* AI Tool badge */}
      {day.ai_tool && status !== 'locked' && (
        <Badge
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-purple-100 text-purple-700"
        >
          <Sparkles className="w-2 h-2 mr-0.5" />
          AI
        </Badge>
      )}

      {/* Current day indicator */}
      {isCurrentDay && status === 'available' && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.button>
  );
}

// Stats component for the top of the dashboard
interface KickstartStatsProps {
  totalDays: number;
  completedDays: number;
  currentDay: number;
  currentWeek: number;
}

export function KickstartStats({
  totalDays,
  completedDays,
  currentDay,
  currentWeek,
}: KickstartStatsProps) {
  const percentage = Math.round((completedDays / totalDays) * 100);

  return (
    <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">De Kickstart</h2>
            <p className="text-pink-100">21 dagen naar dating succes</p>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold">{percentage}%</div>
            <p className="text-pink-100">voltooid</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-pink-100 mb-2">
            <span>Week {currentWeek} - Dag {currentDay}</span>
            <span>
              {completedDays} / {totalDays} dagen
            </span>
          </div>
          <div className="w-full bg-pink-400/30 rounded-full h-3">
            <motion.div
              className="bg-white rounded-full h-3"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-pink-400/30">
          <div className="text-center">
            <div className="text-2xl font-bold">{completedDays}</div>
            <div className="text-xs text-pink-100">Dagen voltooid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{currentWeek}</div>
            <div className="text-xs text-pink-100">Huidige week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalDays - completedDays}</div>
            <div className="text-xs text-pink-100">Dagen te gaan</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
