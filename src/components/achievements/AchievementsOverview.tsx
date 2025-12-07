'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Flame, Star, Lock, TrendingUp } from 'lucide-react';
import {
  ACHIEVEMENTS,
  getAchievementsByCategory,
  getTierColor,
  getTierBgColor,
  type Achievement,
  type AchievementCategory,
  type AchievementProgress,
  type AchievementStats,
} from '@/types/achievement.types';
import { AchievementCard } from './AchievementBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface AchievementsOverviewProps {
  userId?: number;
}

export function AchievementsOverview({ userId }: AchievementsOverviewProps) {
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('datespark_auth_token');

      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAchievements(data.achievements);
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.achievement.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = stats?.total_points || 0;
  const completionPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  const categoryIcons: Record<AchievementCategory | 'all', any> = {
    all: Target,
    milestone: Trophy,
    streak: Flame,
    engagement: Star,
    mastery: TrendingUp,
  };

  const categoryLabels: Record<AchievementCategory | 'all', string> = {
    all: 'Alle',
    milestone: 'Mijlpalen',
    streak: 'Streaks',
    engagement: 'Betrokkenheid',
    mastery: 'Meesterschap',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {unlockedCount}/{ACHIEVEMENTS.length}
                </div>
                <div className="text-sm text-purple-600">Achievements behaald</div>
              </div>
            </div>
            <Progress value={completionPercent} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-900">{totalPoints}</div>
                <div className="text-sm text-yellow-600">Totale punten</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {stats?.by_category.streak || 0}
                </div>
                <div className="text-sm text-blue-600">Streak achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          {(['all', 'milestone', 'streak', 'engagement', 'mastery'] as const).map((cat) => {
            const Icon = categoryIcons[cat];
            const count = cat === 'all'
              ? unlockedCount
              : achievements.filter((a) => a.achievement.category === cat && a.unlocked).length;

            return (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{categoryLabels[cat]}</span>
                <span className="text-xs text-gray-500">({count})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Geen achievements in deze categorie</p>
              </motion.div>
            ) : (
              filteredAchievements.map((achievement, idx) => (
                <motion.div
                  key={achievement.achievement.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <AchievementCard
                    achievement={achievement.achievement}
                    unlocked={achievement.unlocked}
                    unlockedAt={achievement.unlocked_at}
                    currentProgress={achievement.current_progress}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Recent Unlocks */}
      {stats?.recent_unlocks && stats.recent_unlocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Recent Behaald
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_unlocks.map((unlock) => {
                const achievement = ACHIEVEMENTS.find((a) => a.slug === unlock.achievement_slug);
                if (!achievement) return null;

                return (
                  <div
                    key={unlock.achievement_slug}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center shadow-sm`}>
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{achievement.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(unlock.unlocked_at).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                        <Star className="w-4 h-4" />
                        {achievement.points}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
