'use client';

/**
 * Achievement Showcase - Display user achievements met badges
 * Sprint 3: Het Pad
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Award, Crown, Zap, Target, Heart, Sparkles,
  X, Lock, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/lib/achievements/achievement-tracker';

interface AchievementShowcaseProps {
  userId?: number;
  compact?: boolean;
}

export function AchievementShowcase({ userId, compact = false }: AchievementShowcaseProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/achievements/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements || []);
          setProgress(data.progress || null);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  const iconMap: Record<string, any> = {
    'Trophy': Trophy,
    'Star': Star,
    'Award': Award,
    'Crown': Crown,
    'Zap': Zap,
    'Target': Target,
    'Heart': Heart,
    'Sparkles': Sparkles,
    'TrendingUp': TrendingUp
  };

  const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
    'common': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
    'uncommon': { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
    'rare': { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
    'epic': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
    'legendary': { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-coral-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (compact) {
    // Compact view voor in dashboard
    return (
      <Card className="border-2 border-coral-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Achievements</h3>
            </div>
            <Badge variant="secondary">
              {achievements.length} / {progress?.total || 0}
            </Badge>
          </div>

          {progress && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Totaal</span>
                <span className="font-medium text-coral-600">{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          )}

          {/* Recent achievements (max 3) */}
          <div className="grid grid-cols-3 gap-2">
            {achievements.slice(0, 3).map((achievement) => {
              const IconComponent = iconMap[achievement.badge_icon] || Trophy;
              const colors = rarityColors[achievement.rarity] || rarityColors.common;

              return (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "p-3 rounded-lg border-2 flex flex-col items-center gap-2 cursor-pointer",
                    colors.bg,
                    colors.border
                  )}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <IconComponent className={cn("w-6 h-6", colors.text)} />
                  <span className="text-xs text-center font-medium text-gray-700 line-clamp-2">
                    {achievement.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full showcase view
  return (
    <div className="space-y-6">
      {/* Header met progress */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-900">Jouw Achievements</h2>
        </div>

        {progress && (
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-lg">
              <span className="font-medium text-gray-700">
                {achievements.length} van {progress.total} ontgrendeld
              </span>
              <span className="font-bold text-coral-600">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-4" />
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Totaal punten: {achievements.reduce((sum, a) => sum + a.points, 0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.badge_icon] || Trophy;
          const colors = rarityColors[achievement.rarity] || rarityColors.common;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card
                className={cn(
                  "cursor-pointer border-2 transition-all hover:shadow-lg",
                  colors.border
                )}
                onClick={() => setSelectedAchievement(achievement)}
              >
                <CardContent className={cn("p-4 text-center space-y-2", colors.bg)}>
                  <div className="flex justify-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      colors.bg === 'bg-gray-100' ? 'bg-white' : colors.bg
                    )}>
                      <IconComponent className={cn("w-8 h-8", colors.text)} />
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm">{achievement.name}</h3>

                  <Badge variant="secondary" className="text-xs">
                    {achievement.rarity}
                  </Badge>

                  <div className="flex items-center justify-center gap-1 text-sm font-medium text-yellow-600">
                    <Star className="w-4 h-4" />
                    <span>{achievement.points}pts</span>
                  </div>

                  {achievement.earned_at && (
                    <p className="text-xs text-gray-500">
                      {new Date(achievement.earned_at).toLocaleDateString('nl-NL')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Locked achievements (toon er een paar) */}
        {progress && progress.total > achievements.length && (
          <Card className="border-2 border-dashed border-gray-300 opacity-50">
            <CardContent className="p-4 text-center space-y-2 bg-gray-50">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500">Verborgen Achievement</p>
              <p className="text-xs text-gray-400">Blijf groeien om te ontgrendelen!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              {(() => {
                const IconComponent = iconMap[selectedAchievement.badge_icon] || Trophy;
                const colors = rarityColors[selectedAchievement.rarity] || rarityColors.common;

                return (
                  <>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setSelectedAchievement(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className={cn(
                          "w-24 h-24 rounded-full flex items-center justify-center",
                          colors.bg
                        )}>
                          <IconComponent className={cn("w-12 h-12", colors.text)} />
                        </div>
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedAchievement.name}
                        </h2>
                        <Badge variant="secondary" className={colors.text}>
                          {selectedAchievement.rarity.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-gray-600">{selectedAchievement.description}</p>

                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-600">
                        <Star className="w-6 h-6" />
                        <span>{selectedAchievement.points} Punten</span>
                      </div>

                      {selectedAchievement.earned_at && (
                        <p className="text-sm text-gray-500">
                          Ontgrendeld op {new Date(selectedAchievement.earned_at).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      )}

                      <Button
                        onClick={() => setSelectedAchievement(null)}
                        className="w-full bg-gradient-to-r from-coral-500 to-coral-600"
                      >
                        Sluiten
                      </Button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
