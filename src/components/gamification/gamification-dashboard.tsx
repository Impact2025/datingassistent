'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Flame,
  Target,
  Star,
  Award,
  TrendingUp,
  Calendar,
  Zap,
  CheckCircle2,
  Gift
} from 'lucide-react';

interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
  weeklyProgress: number;
  level: number;
  nextLevelPoints: number;
}

interface EarnedBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function GamificationDashboard() {
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 1247,
    currentStreak: 5,
    longestStreak: 12,
    badgesEarned: 8,
    weeklyProgress: 75,
    level: 3,
    nextLevelPoints: 1500
  });

  const [recentBadges, setRecentBadges] = useState<EarnedBadge[]>([
    {
      id: 1,
      name: 'Eerste Stap',
      description: 'Voltooi je eerste activiteit',
      icon: '🎯',
      earnedAt: new Date('2024-11-10'),
      rarity: 'common'
    },
    {
      id: 2,
      name: 'Profiel Verkenner',
      description: 'Voer 5 profiel analyses uit',
      icon: '🔍',
      earnedAt: new Date('2024-11-12'),
      rarity: 'rare'
    },
    {
      id: 3,
      name: 'Chat Kampioen',
      description: 'Gebruik de chat coach 10 keer',
      icon: '💬',
      earnedAt: new Date('2024-11-13'),
      rarity: 'epic'
    }
  ]);

  const [dailyChallenges] = useState([
    {
      id: 1,
      title: 'Profiel Check',
      description: 'Analyseer je profiel met AI',
      points: 15,
      completed: true,
      icon: '📸'
    },
    {
      id: 2,
      title: 'Bericht Oefenen',
      description: 'Genereer 3 openingsberichten',
      points: 10,
      completed: false,
      icon: '💬'
    },
    {
      id: 3,
      title: 'Reflectie Moment',
      description: 'Beantwoord een reflectievraag',
      points: 5,
      completed: false,
      icon: '🤔'
    }
  ]);

  const levelProgress = (stats.totalPoints / stats.nextLevelPoints) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'rare': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'epic': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'legendary': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold dark:text-white">{stats.totalPoints}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Punten</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-6 w-6 text-orange-500 mr-2" />
              <span className="text-2xl font-bold dark:text-white">{stats.currentStreak}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Streaks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-purple-500 mr-2" />
              <span className="text-2xl font-bold dark:text-white">{stats.badgesEarned}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Badges</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-2xl font-bold dark:text-white">Niveau {stats.level}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Level Progress
          </CardTitle>
          <CardDescription>
            {stats.nextLevelPoints - stats.totalPoints} punten tot niveau {stats.level + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={levelProgress} className="mb-2" />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Niveau {stats.level}</span>
            <span>Niveau {stats.level + 1}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Badges
            </CardTitle>
            <CardDescription>
              Je nieuwste prestaties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBadges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium dark:text-white">{badge.name}</span>
                      <Badge className={getRarityColor(badge.rarity)} variant="secondary">
                        {badge.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {badge.earnedAt.toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Gift className="h-4 w-4 mr-2" />
              Bekijk alle badges
            </Button>
          </CardContent>
        </Card>

        {/* Daily Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dagelijkse Uitdagingen
            </CardTitle>
            <CardDescription>
              Verdien extra punten vandaag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                    challenge.completed
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-xl">{challenge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${challenge.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'dark:text-white'}`}>
                        {challenge.title}
                      </span>
                      {challenge.completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">+{challenge.points} punten</span>
                    </div>
                  </div>
                  {!challenge.completed && (
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Wekelijkse Voortgang
          </CardTitle>
          <CardDescription>
            Je voortgang deze week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Profiel Score</span>
                <span>85/100</span>
              </div>
              <Progress value={85} className="mb-4" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Gespreksvaardigheden</span>
                <span>72/100</span>
              </div>
              <Progress value={72} className="mb-4" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Consistentie</span>
                <span>90/100</span>
              </div>
              <Progress value={90} className="mb-4" />
            </div>

            <div className="pt-4 border-t dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Deze week verdien je:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">+150 bonuspunten voor je streak!</p>
                </div>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  <Flame className="h-3 w-3 mr-1" />
                  {stats.currentStreak} dagen
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Prestatie Showcase
          </CardTitle>
          <CardDescription>
            Deel je successen met de community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold dark:text-white">Top 10%</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">van alle gebruikers</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <Flame className="mx-auto mb-2 h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold dark:text-white">12 dagen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">langste streak</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <Award className="mx-auto mb-2 h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold dark:text-white">8 badges</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">verdiend</p>
            </div>
          </div>
          <Button className="w-full mt-4" variant="outline">
            Deel in Community
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}