"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Flame,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Share2,
  Lock,
  CheckCircle
} from "lucide-react";

interface BadgeShowcaseProps {
  userId: number;
  onBadgeClick?: (badge: any) => void;
}

interface UserBadge {
  id: number;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeCategory: string;
  badgeRarity: string;
  points: number;
  earnedAt: Date;
  isNew: boolean;
}

interface BadgeProgress {
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  isCompleted: boolean;
}

export function BadgeShowcase({ userId, onBadgeClick }: BadgeShowcaseProps) {
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNewBadges, setShowNewBadges] = useState(true);

  useEffect(() => {
    loadBadgeData();
  }, [userId]);

  const loadBadgeData = async () => {
    // Mock data - in real implementation, this would call the API
    const mockEarnedBadges: UserBadge[] = [
      {
        id: 1,
        badgeName: 'Eerste Stap',
        badgeDescription: '7 dagen actief gebleven',
        badgeIcon: '👶',
        badgeCategory: 'streak',
        badgeRarity: 'common',
        points: 10,
        earnedAt: new Date('2025-11-01'),
        isNew: false
      },
      {
        id: 2,
        badgeName: 'Momentum Bouwer',
        badgeDescription: '30 dagen op rij actief',
        badgeIcon: '🚀',
        badgeCategory: 'streak',
        badgeRarity: 'uncommon',
        points: 50,
        earnedAt: new Date('2025-11-10'),
        isNew: true
      },
      {
        id: 3,
        badgeName: 'Communicator',
        badgeDescription: '50 berichten verstuurd',
        badgeIcon: '💬',
        badgeCategory: 'social',
        badgeRarity: 'common',
        points: 15,
        earnedAt: new Date('2025-11-05'),
        isNew: false
      }
    ];

    const mockProgress: BadgeProgress[] = [
      {
        badgeId: 4,
        badgeName: 'Onverslaanbaar',
        badgeDescription: '100 dagen streak!',
        currentValue: 45,
        targetValue: 100,
        progress: 45,
        isCompleted: false
      },
      {
        badgeId: 5,
        badgeName: 'Date Master',
        badgeDescription: 'Eerste date gepland',
        currentValue: 0,
        targetValue: 1,
        progress: 0,
        isCompleted: false
      },
      {
        badgeId: 6,
        badgeName: 'Profiel Pro',
        badgeDescription: 'Profiel volledig geoptimaliseerd',
        currentValue: 75,
        targetValue: 100,
        progress: 75,
        isCompleted: false
      }
    ];

    setEarnedBadges(mockEarnedBadges);
    setBadgeProgress(mockProgress);
    setTotalPoints(75);
  };

  const categories = [
    { id: 'all', label: 'Alle', icon: Trophy },
    { id: 'streak', label: 'Streaks', icon: Flame },
    { id: 'goal', label: 'Doelen', icon: Target },
    { id: 'social', label: 'Sociaal', icon: Users },
    { id: 'profile', label: 'Profiel', icon: Star },
    { id: 'consistency', label: 'Consistentie', icon: Calendar },
    { id: 'milestone', label: 'Mijlpalen', icon: TrendingUp }
  ];

  const filteredBadges = selectedCategory === 'all'
    ? earnedBadges
    : earnedBadges.filter(badge => badge.badgeCategory === selectedCategory);

  const newBadges = earnedBadges.filter(badge => badge.isNew);

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-600 border-gray-300',
      uncommon: 'text-green-600 border-green-300',
      rare: 'text-blue-600 border-blue-300',
      epic: 'text-purple-600 border-purple-300',
      legendary: 'text-yellow-600 border-yellow-300'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityBackground = (rarity: string) => {
    const backgrounds = {
      common: 'bg-gray-50',
      uncommon: 'bg-green-50',
      rare: 'bg-blue-50',
      epic: 'bg-purple-50',
      legendary: 'bg-yellow-50'
    };
    return backgrounds[rarity as keyof typeof backgrounds] || backgrounds.common;
  };

  const shareBadge = (badge: UserBadge) => {
    if (navigator.share) {
      navigator.share({
        title: `Ik heb de badge "${badge.badgeName}" verdiend!`,
        text: `Ik heb net de "${badge.badgeName}" badge verdiend in mijn dating journey: ${badge.badgeDescription}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Ik heb net de "${badge.badgeName}" badge verdiend: ${badge.badgeDescription} 🎉`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Jouw Badges & Prestaties
          </h1>
          <p className="text-gray-600">
            Elke badge is een stap richting dating succes
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold mb-1">{earnedBadges.length}</div>
                  <div className="text-yellow-100">Badges Verdiend</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">{totalPoints}</div>
                  <div className="text-yellow-100">Totaal Punten</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">
                    {badgeProgress.filter(p => p.isCompleted).length}
                  </div>
                  <div className="text-yellow-100">Voltooide Doelen</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">{newBadges.length}</div>
                  <div className="text-yellow-100">Nieuwe Badges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* New Badges Alert */}
        <AnimatePresence>
          {newBadges.length > 0 && showNewBadges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        🎉 Nieuwe Badges Verdiend!
                      </h3>
                      <div className="space-y-2">
                        {newBadges.map((badge) => (
                          <div key={badge.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <span className="text-2xl">{badge.badgeIcon}</span>
                            <div>
                              <div className="font-semibold text-gray-800">{badge.badgeName}</div>
                              <div className="text-sm text-gray-600">{badge.badgeDescription}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewBadges(false)}
                      className="flex-shrink-0"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <IconComponent className="w-4 h-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Earned Badges */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Verdiende Badges ({filteredBadges.length})
          </h2>

          {filteredBadges.length === 0 ? (
            <Card className="border-0 shadow-lg bg-gray-50">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nog geen badges in deze categorie
                </h3>
                <p className="text-gray-500">
                  Blijf actief om badges te verdienen!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`border-0 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl ${getRarityBackground(badge.badgeRarity)} ${badge.isNew ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => onBadgeClick?.(badge)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="text-4xl mb-2">{badge.badgeIcon}</div>
                          {badge.isNew && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">
                            {badge.badgeName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {badge.badgeDescription}
                          </p>
                          <Badge className={getRarityColor(badge.badgeRarity)}>
                            {badge.badgeRarity}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {badge.points} punten
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              shareBadge(badge);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Badge Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Badge Voortgang ({badgeProgress.length})
          </h2>

          <div className="grid gap-4">
            {badgeProgress.map((progress, index) => (
              <motion.div
                key={progress.badgeId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {progress.badgeName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {progress.badgeDescription}
                        </p>
                      </div>
                      {progress.isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{progress.currentValue} / {progress.targetValue}</span>
                        <span>{Math.round(progress.progress)}%</span>
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                    </div>

                    {!progress.isCompleted && (
                      <p className="text-xs text-gray-500 mt-2">
                        Nog {progress.targetValue - progress.currentValue} te gaan
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">
                Elke badge brengt je dichterbij succes! 💪
              </h3>
              <p className="text-blue-100">
                Blijf consistent en verdien meer badges voor je dating journey
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}