'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, TrendingUp, Loader2, Snowflake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeCount: number;
  totalDaysCompleted: number;
}

interface StreakDisplayProps {
  /**
   * Display mode: compact for header, full for dashboard card
   */
  variant?: 'compact' | 'full' | 'minimal';
  className?: string;
}

export function StreakDisplay({ variant = 'full', className }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('datespark_auth_token');

      const response = await fetch('/api/kickstart/streak', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch streak');
      }

      const data = await response.json();
      if (data.success) {
        setStreak(data.streak);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching streak:', err);
      setError(err instanceof Error ? err.message : 'Failed to load streak');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !streak) {
    return null; // Silently fail for better UX
  }

  // Minimal variant (for tight spaces like mobile header)
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-semibold text-orange-600">
          {streak.currentStreak}
        </span>
      </div>
    );
  }

  // Compact variant (for headers)
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2.5 rounded-xl border border-orange-200',
          className
        )}
      >
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-xs text-orange-600 font-medium">Streak</p>
          <p className="text-lg font-bold text-orange-700">{streak.currentStreak} dagen</p>
        </div>
        {streak.streakFreezeCount > 0 && (
          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs ml-auto">
            <Snowflake className="w-3 h-3 mr-1" />
            {streak.streakFreezeCount}
          </Badge>
        )}
      </motion.div>
    );
  }

  // Full variant (for dashboard card)
  return (
    <Card className={cn('border-orange-100 shadow-sm overflow-hidden', className)}>
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <p className="text-sm opacity-90">Huidige streak</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={streak.currentStreak}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="text-3xl font-bold"
                >
                  {streak.currentStreak}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {streak.streakFreezeCount > 0 && (
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <Snowflake className="w-3 h-3 mr-1" />
              {streak.streakFreezeCount} freezes
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Longest Streak */}
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-600 font-medium">Langste</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">{streak.longestStreak}</p>
          </div>

          {/* Total Days */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium mb-1">Totaal</p>
            <p className="text-2xl font-bold text-green-700">{streak.totalDaysCompleted}</p>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
          <p className="text-sm text-orange-800">
            {streak.currentStreak === 0 && '🔥 Start vandaag je streak!'}
            {streak.currentStreak === 1 && '🎉 Geweldig! Blijf doorgaan!'}
            {streak.currentStreak >= 2 && streak.currentStreak < 7 && '💪 Je bent goed bezig!'}
            {streak.currentStreak >= 7 && streak.currentStreak < 14 && '🔥 Een week! Unstoppable!'}
            {streak.currentStreak >= 14 && streak.currentStreak < 21 && '🚀 Twee weken! Ongelofelijk!'}
            {streak.currentStreak >= 21 && '👑 21 dagen! Je bent een legende!'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Streak milestone badges
 */
export function getStreakMilestone(streak: number): { emoji: string; title: string } | null {
  if (streak >= 21) return { emoji: '👑', title: '21-Dag Legende' };
  if (streak >= 14) return { emoji: '🚀', title: '2-Week Warrior' };
  if (streak >= 7) return { emoji: '🔥', title: 'Week Champion' };
  if (streak >= 3) return { emoji: '💪', title: '3-Dag Fire' };
  if (streak >= 1) return { emoji: '🎯', title: 'Streak Started' };
  return null;
}
