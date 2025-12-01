'use client';

/**
 * Gamification Widget - Points, Streaks, Challenges & Level display
 * Sprint 4: Gamification & Engagement
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Star, Trophy, Target, Zap, TrendingUp,
  Award, Crown, CheckCircle2, Lock, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

interface GamificationWidgetProps {
  userId?: number;
  compact?: boolean;
  onViewDetails?: () => void;
}

interface UserStats {
  totalPoints: number;
  currentLevel: number;
  levelProgress: number;
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  levelTitle: string;
  pointsToNextLevel: number;
  nextLevelPoints: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  pointsReward: number;
  status: 'active' | 'completed' | 'locked';
}

export function GamificationWidget({ userId, compact = false, onViewDetails }: GamificationWidgetProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [todayChallenges, setTodayChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChallenges, setShowChallenges] = useState(!compact);

  useEffect(() => {
    const fetchGamificationData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const [statsResponse, challengesResponse] = await Promise.all([
          fetch(`/api/gamification/stats?userId=${userId}`),
          fetch(`/api/gamification/challenges?userId=${userId}`)
        ]);

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data);
        }

        if (challengesResponse.ok) {
          const data = await challengesResponse.json();
          setTodayChallenges(data.challenges || []);
        }
      } catch (error) {
        console.error('Error fetching gamification data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, [userId]);

  if (loading) {
    return null; // Don't show loading state, just hide widget
  }

  if (!stats) {
    return null; // Hide widget if no stats available
  }

  if (compact) {
    // Compact view for dashboard sidebar
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Jouw Progress</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="text-purple-600 hover:text-purple-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Level & Points */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">
                  Level {stats.currentLevel}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-purple-600">
                <Star className="w-4 h-4" />
                <span>{stats.totalPoints.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Progress value={stats.levelProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-right">
                {stats.pointsToNextLevel} punten tot level {stats.currentLevel + 1}
              </p>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Flame className={cn(
                  "w-5 h-5",
                  stats.currentStreak > 0 ? "text-orange-500" : "text-gray-400"
                )} />
                <span className="text-sm font-medium text-gray-700">
                  {stats.currentStreak} dag{stats.currentStreak !== 1 ? 'en' : ''} streak
                </span>
              </div>
              {stats.todayCompleted && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>

            {/* Today's Challenges Summary */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Vandaag</span>
                <span className="font-medium text-purple-600">
                  {todayChallenges.filter(c => c.status === 'completed').length}/{todayChallenges.length} challenges
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Points & Level */}
        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Totale Punten</p>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="text-3xl font-bold text-purple-600">
                    {stats.totalPoints.toLocaleString()}
                  </span>
                </div>
              </div>
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Level {stats.currentLevel}: {stats.levelTitle}</span>
                <span className="font-medium text-purple-600">{stats.levelProgress}%</span>
              </div>
              <Progress value={stats.levelProgress} className="h-3" />
              <p className="text-xs text-gray-500">
                {stats.pointsToNextLevel} punten tot level {stats.currentLevel + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Huidige Streak</p>
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span className="text-3xl font-bold text-orange-600">
                    {stats.currentStreak}
                  </span>
                  <span className="text-gray-500">dagen</span>
                </div>
              </div>
              {stats.todayCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <Lock className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Langste streak</span>
                <span className="text-sm font-bold text-orange-600">
                  {stats.longestStreak} dagen
                </span>
              </div>
              {!stats.todayCompleted && (
                <p className="text-xs text-gray-500">
                  Log vandaag in om je streak te behouden!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Challenges Today */}
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Challenges Vandaag</p>
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-500" />
                  <span className="text-3xl font-bold text-blue-600">
                    {todayChallenges.filter(c => c.status === 'completed').length}
                  </span>
                  <span className="text-gray-500">/ {todayChallenges.length}</span>
                </div>
              </div>
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-2">
              <Progress
                value={(todayChallenges.filter(c => c.status === 'completed').length / todayChallenges.length) * 100}
                className="h-3"
              />
              <p className="text-xs text-gray-500">
                Voltooi alle challenges voor bonus punten!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Challenges */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Dagelijkse Challenges</h2>
            </div>
            <Badge variant="secondary">
              {todayChallenges.filter(c => c.status === 'completed').length} voltooid
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayChallenges.slice(0, 6).map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  challenge.status === 'completed' ? "bg-green-50 border-green-300" : "bg-white border-gray-200 hover:border-purple-300"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    challenge.status === 'completed' ? "bg-green-100" : "bg-purple-50"
                  )}>
                    {challenge.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Zap className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                    <Star className="w-4 h-4" />
                    <span>{challenge.pointsReward}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{challenge.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>

                {challenge.status !== 'completed' && (
                  <div className="space-y-1">
                    <Progress value={challenge.progress} className="h-2" />
                    <p className="text-xs text-gray-500">{challenge.progress}%</p>
                  </div>
                )}

                {challenge.status === 'completed' && (
                  <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Voltooid!
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {todayChallenges.length > 6 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setShowChallenges(!showChallenges)}
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                {showChallenges ? 'Toon minder' : `Toon alle ${todayChallenges.length} challenges`}
                <ChevronRight className={cn(
                  "w-4 h-4 ml-2 transition-transform",
                  showChallenges && "rotate-90"
                )} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
