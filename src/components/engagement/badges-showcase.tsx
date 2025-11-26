"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Award,
  Star,
  Lock,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { AchievementSystem } from "@/components/ui/achievement-system";

interface BadgesShowcaseProps {
  userId: number;
}

interface BadgeData {
  type: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  earned: boolean;
  progress: number;
  earnedAt?: string;
}

export function BadgesShowcase({ userId }: BadgesShowcaseProps) {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [nextBadge, setNextBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      const response = await fetch(`/api/engagement/badges?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges);
        setTotalEarned(data.totalEarned);
        setTotalAvailable(data.totalAvailable);
        setNextBadge(data.nextBadge);
      }
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const completionRate = totalAvailable > 0 ? (totalEarned / totalAvailable) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement System */}
      <AchievementSystem />

      {/* Header Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-primary" />
            Jouw Prestaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">{totalEarned}</div>
              <div className="text-sm text-muted-foreground">badges verdiend</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Voortgang</div>
              <div className="text-lg font-semibold">{Math.round(completionRate)}%</div>
            </div>
          </div>
          <Progress value={completionRate} className="h-2" />

          {/* Next Badge Preview */}
          {nextBadge && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">Volgende badge</div>
                  <div className="font-semibold">{nextBadge.name}</div>
                  <div className="text-sm text-muted-foreground">{nextBadge.description}</div>
                  <div className="mt-2">
                    <Progress value={nextBadge.progress} className="h-1.5" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(nextBadge.progress)}% voltooid
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Collectie</CardTitle>
        </CardHeader>
        <CardContent>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatePresence>
                {earnedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="border rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">{badge.icon}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {badge.description}
                      </p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {badge.tier}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Nog geen badges verdiend</h3>
              <p className="text-sm text-muted-foreground">
                Voltooi taken en bouw je streak op om badges te verdienen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface BadgeGridProps {
  badges: BadgeData[];
  getTierColor: (tier: string) => string;
  getTierBadgeClass: (tier: string) => string;
}

function BadgeGrid({ badges, getTierColor, getTierBadgeClass }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AnimatePresence>
        {badges.map((badge, index) => (
          <motion.div
            key={badge.type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`relative overflow-hidden transition-all hover:scale-105 ${
              badge.earned ? 'border-2' : 'opacity-60'
            }`}>
              <CardContent className="p-4 text-center">
                {/* Badge Icon */}
                <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${getTierColor(badge.tier)} flex items-center justify-center text-4xl mb-3 relative`}>
                  {badge.earned ? (
                    badge.icon
                  ) : (
                    <>
                      <Lock className="w-8 h-8 text-white absolute" />
                      <div className="text-2xl opacity-30">{badge.icon}</div>
                    </>
                  )}
                </div>

                {/* Badge Name */}
                <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {badge.description}
                </p>

                {/* Tier Badge */}
                <Badge className={`text-xs ${getTierBadgeClass(badge.tier)}`}>
                  {badge.tier}
                </Badge>

                {/* Points */}
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-yellow-600">
                  <Star className="w-3 h-3" />
                  <span className="font-semibold">+{badge.points} pts</span>
                </div>

                {/* Progress for unearned badges */}
                {!badge.earned && badge.progress > 0 && (
                  <div className="mt-3">
                    <Progress value={badge.progress} className="h-1.5" />
                    <span className="text-xs text-gray-500 mt-1 block">
                      {Math.round(badge.progress)}%
                    </span>
                  </div>
                )}

                {/* Earned date */}
                {badge.earned && badge.earnedAt && (
                  <div className="mt-2 text-xs text-green-600 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Verdiend
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
